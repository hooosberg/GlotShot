const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const { createLicenseService } = require('./licenseService.cjs');
const { buildMenuTemplate, buildDockMenuTemplate } = require('./menuTemplate.cjs');
const { buildUnsavedChangesDialogOptions, resolveUnsavedChangesAction } = require('./windowCloseHelpers.cjs');

const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5187/app.html';
const PROJECT_FILE_EXTENSION = '.glotshot';

const windows = new Set();
const windowState = new Map();
const pendingSaveBeforeClose = new Map();
let menuLabels = {};
let nextSaveBeforeCloseRequestId = 1;

const getLiveWindows = () => [...windows].filter((win) => win && !win.isDestroyed());
const getPrimaryWindow = () => getLiveWindows()[0] || null;
const getFocusedOrPrimaryWindow = () => BrowserWindow.getFocusedWindow() || getPrimaryWindow();

function ensureProjectExtension(filePath) {
  if (!filePath) return filePath;
  return path.extname(filePath) ? filePath : `${filePath}${PROJECT_FILE_EXTENSION}`;
}

function focusWindow(win) {
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function sendToFocusedWindow(channel, ...args) {
  const win = getFocusedOrPrimaryWindow();
  if (!win) return;
  win.webContents.send(channel, ...args);
}

function getWindowState(win) {
  if (!win) return null;
  if (!windowState.has(win)) {
    windowState.set(win, {
      title: app.name,
      projectName: app.name,
      isDirty: false,
      filePath: '',
      isForceClosing: false,
      isPromptingClose: false,
    });
  }

  return windowState.get(win);
}

function getTranslator() {
  return (key, fallback) => (menuLabels && menuLabels[key]) ? menuLabels[key] : fallback;
}

function forceCloseWindow(win) {
  const state = getWindowState(win);
  if (!state) return;

  state.isForceClosing = true;
  win.close();
}

function requestRendererSaveBeforeClose(win) {
  return new Promise((resolve) => {
    if (!win || win.isDestroyed()) {
      resolve({ success: false, canceled: true });
      return;
    }

    const requestId = nextSaveBeforeCloseRequestId++;
    const timeoutId = setTimeout(() => {
      pendingSaveBeforeClose.delete(requestId);
      resolve({ success: false, canceled: true, error: 'Save before close timed out' });
    }, 120000);

    pendingSaveBeforeClose.set(requestId, {
      webContentsId: win.webContents.id,
      resolve: (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      }
    });

    win.webContents.send('project-save-before-close', { requestId });
  });
}

async function handleWindowCloseRequest(win) {
  const state = getWindowState(win);
  if (!state || state.isPromptingClose) return;

  state.isPromptingClose = true;

  try {
    const T = getTranslator();
    const response = dialog.showMessageBoxSync(
      win,
      buildUnsavedChangesDialogOptions({
        T,
        projectName: state.projectName || state.title || app.name,
      })
    );
    const action = resolveUnsavedChangesAction(response);

    if (action === 'discard') {
      forceCloseWindow(win);
      return;
    }

    if (action === 'save') {
      const result = await requestRendererSaveBeforeClose(win);
      if (result?.success) {
        forceCloseWindow(win);
      }
    }
  } finally {
    const nextState = getWindowState(win);
    if (nextState) {
      nextState.isPromptingClose = false;
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
  });

  windows.add(win);
  getWindowState(win);

  win.once('ready-to-show', () => {
    focusWindow(win);
  });

  if (isDev) {
    console.log('Loading dev renderer:', devServerUrl);
    win.loadURL(devServerUrl);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/app.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page load failed:', errorCode, errorDescription, validatedURL);
    win.loadURL(`data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Load Error</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #1a1a2e;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
            text-align: center;
          }
          h1 { font-size: 24px; margin-bottom: 16px; }
          p { color: #a1a1a6; margin-bottom: 24px; }
          button {
            padding: 12px 32px;
            font-size: 16px;
            background: #0d84ff;
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
          }
          button:hover { background: #0a6ecc; }
        </style>
      </head>
      <body>
        <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
        <h1>Unable to load application</h1>
        <p>Error: ${errorDescription} (${errorCode})</p>
        <button onclick="location.reload()">Retry</button>
      </body>
      </html>
    `);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully:', win.webContents.getURL());
  });

  win.on('closed', () => {
    windows.delete(win);
    windowState.delete(win);
  });

  win.on('close', (event) => {
    const state = getWindowState(win);
    if (!state || state.isForceClosing || !state.isDirty) return;

    event.preventDefault();
    void handleWindowCloseRequest(win);
  });

  return win;
}

function createMenu(labels = menuLabels) {
  const isMac = process.platform === 'darwin';
  menuLabels = labels || menuLabels || {};
  const T = (key, defaultVal) => (menuLabels && menuLabels[key]) ? menuLabels[key] : defaultVal;

  const handlers = {
    appName: app.name,
    onAbout: () => sendToFocusedWindow('show-about'),
    onSettings: () => sendToFocusedWindow('show-settings'),
    onNewFile: () => sendToFocusedWindow('menu-project-new'),
    onOpenProject: () => sendToFocusedWindow('menu-project-open'),
    onSaveProject: () => sendToFocusedWindow('menu-project-save'),
    onSaveProjectAs: () => sendToFocusedWindow('menu-project-save-as'),
    onNewWindow: () => focusWindow(createWindow()),
    onImportScreenshots: () => sendToFocusedWindow('menu-import'),
    onExportByLanguage: () => sendToFocusedWindow('menu-export-language'),
    onExportByDevice: () => sendToFocusedWindow('menu-export-device'),
    onModeScreenshot: () => sendToFocusedWindow('menu-mode-screenshot'),
    onModeIcon: () => sendToFocusedWindow('menu-mode-icon'),
    onShowMainWindow: () => {
      const win = getFocusedOrPrimaryWindow() || createWindow();
      focusWindow(win);
    },
    onVisitWebsite: async () => {
      await shell.openExternal('https://hooosberg.github.io/GlotShot/');
    },
    onVisitGithub: async () => {
      await shell.openExternal('https://github.com/hooosberg/GlotShot');
    },
    onAboutDeveloper: async () => {
      await shell.openExternal('https://github.com/hooosberg');
    },
  };

  const menu = Menu.buildFromTemplate(buildMenuTemplate({ isMac, T, handlers }));
  Menu.setApplicationMenu(menu);

  if (isMac && app.dock) {
    const dockMenu = Menu.buildFromTemplate(buildDockMenuTemplate({ T, handlers }));
    app.dock.setMenu(dockMenu);
  }
}

app.whenReady().then(() => {
  app.setName('GlotShot');
  createMenu();
  createWindow();

  const licenseService = createLicenseService();

  ipcMain.on('update-menu-language', (event, labels) => {
    createMenu(labels);
  });

  ipcMain.on('project:save-before-close-result', (event, payload = {}) => {
    const request = pendingSaveBeforeClose.get(payload.requestId);
    if (!request || request.webContentsId !== event.sender.id) return;

    pendingSaveBeforeClose.delete(payload.requestId);
    request.resolve({
      success: Boolean(payload.success),
      canceled: !payload.success,
      error: payload.error || null,
    });
  });

  ipcMain.handle('license:check-status', () => licenseService.checkStatus());
  ipcMain.handle('license:purchase-pro', () => licenseService.purchasePro());
  ipcMain.handle('license:restore-purchases', () => licenseService.restorePurchases());

  ipcMain.handle('get-app-locale', () => app.getLocale());
  ipcMain.handle('window:set-state', (event, payload = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return { success: false };
    const state = getWindowState(win);

    const nextTitle = typeof payload.title === 'string' && payload.title.trim()
      ? payload.title
      : app.name;

    win.setTitle(nextTitle);
    if (state) {
      state.title = nextTitle;
      state.projectName = payload.projectName || nextTitle;
      state.isDirty = Boolean(payload.isDirty);
      state.filePath = payload.filePath || '';
    }

    if (typeof win.setDocumentEdited === 'function') {
      win.setDocumentEdited(Boolean(payload.isDirty));
    }

    if (typeof win.setRepresentedFilename === 'function') {
      win.setRepresentedFilename(payload.filePath || '');
    }

    return { success: true };
  });

  ipcMain.handle('project:open', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Open GlotShot Project',
        properties: ['openFile'],
        filters: [
          { name: 'GlotShot Project', extensions: ['glotshot', 'json'] }
        ]
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
      }

      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf8');

      return {
        canceled: false,
        filePath,
        content,
      };
    } catch (error) {
      console.error('Open project failed:', error);
      return { canceled: false, error: error.message };
    }
  });

  ipcMain.handle('project:save', async (event, payload = {}) => {
    try {
      const filePath = ensureProjectExtension(payload.filePath);
      if (!filePath) {
        return { success: false, error: 'No file path provided' };
      }

      fs.writeFileSync(filePath, payload.content || '', 'utf8');
      return { success: true, filePath };
    } catch (error) {
      console.error('Save project failed:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('project:save-as', async (event, payload = {}) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Save GlotShot Project',
        defaultPath: ensureProjectExtension(payload.defaultPath || 'Untitled.glotshot'),
        filters: [
          { name: 'GlotShot Project', extensions: ['glotshot'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }

      const filePath = ensureProjectExtension(result.filePath);
      if (typeof payload.content === 'string') {
        fs.writeFileSync(filePath, payload.content, 'utf8');
      }

      return {
        canceled: false,
        success: true,
        filePath,
      };
    } catch (error) {
      console.error('Save project as failed:', error);
      return { canceled: false, success: false, error: error.message };
    }
  });

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择导出保存位置',
      buttonLabel: '选择',
      defaultPath: app.getPath('downloads'),
      properties: ['openDirectory', 'createDirectory']
    });
    return result.filePaths[0];
  });

  ipcMain.handle('read-directory-images', async (event, dirPath) => {
    try {
      if (!dirPath || !fs.existsSync(dirPath)) {
        return { success: false, images: [], error: 'Directory not found' };
      }

      const files = fs.readdirSync(dirPath);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const images = [];

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const fullPath = path.join(dirPath, file);
          const data = fs.readFileSync(fullPath);
          const base64 = `data:image/${ext.slice(1)};base64,${data.toString('base64')}`;
          images.push({
            name: file,
            path: fullPath,
            data: base64
          });
        }
      }

      return { success: true, images };
    } catch (e) {
      console.error('Read directory failed:', e);
      return { success: false, images: [], error: e.message };
    }
  });

  ipcMain.handle('select-files', async (event, options) => {
    const { defaultPath, multiSelections = true, filters } = options || {};
    const result = await dialog.showOpenDialog({
      properties: ['openFile', ...(multiSelections ? ['multiSelections'] : [])],
      defaultPath,
      filters: filters || [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }]
    });
    return result.filePaths;
  });

  ipcMain.handle('read-files', async (event, filePaths) => {
    try {
      if (!filePaths || filePaths.length === 0) {
        return { success: false, images: [], error: 'No files provided' };
      }

      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const images = [];

      for (const fullPath of filePaths) {
        if (!fs.existsSync(fullPath)) continue;

        const ext = path.extname(fullPath).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const data = fs.readFileSync(fullPath);
          const base64 = `data:image/${ext.slice(1)};base64,${data.toString('base64')}`;
          images.push({
            name: path.basename(fullPath),
            path: fullPath,
            data: base64
          });
        }
      }

      return { success: true, images };
    } catch (e) {
      console.error('Read files failed:', e);
      return { success: false, images: [], error: e.message };
    }
  });

  ipcMain.handle('save-files', async (event, { basePath, files }) => {
    try {
      if (!basePath) return { success: false, error: 'No base path provided' };

      for (const file of files) {
        const fullPath = path.join(basePath, file.path);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const base64Data = file.data.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(fullPath, Buffer.from(base64Data, 'base64'));
      }
      return { success: true };
    } catch (e) {
      console.error('Save failed:', e);
      return { success: false, error: e.message };
    }
  });

  app.on('activate', () => {
    const liveWindow = getPrimaryWindow();
    if (liveWindow) {
      focusWindow(liveWindow);
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
