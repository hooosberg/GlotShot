const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1080,
    minHeight: 720,
    show: false, // 先隐藏，等内容加载完成后再显示
    backgroundColor: '#1a1a2e', // 设置背景色与应用一致，避免白色闪烁
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset', // Mac-style title bar
  });

  // 窗口准备好后再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/app.html');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/app.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle page load failures (防止白屏)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page load failed:', errorCode, errorDescription, validatedURL);
    // 加载失败时显示错误页面
    mainWindow.loadURL(`data:text/html;charset=utf-8,
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

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu(labels = {}) {
  const isMac = process.platform === 'darwin';

  // Helper to get translation or fallback
  const T = (key, defaultVal) => labels && labels[key] ? labels[key] : defaultVal;

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: T('about', '关于 GlotShot'),
          click: () => {
            if (mainWindow) mainWindow.webContents.send('show-about');
          }
        },
        { type: 'separator' },
        {
          label: T('settings', '设置...'),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('show-settings');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: T('file', '文件'),
      submenu: [
        {
          label: T('importScreenshots', '导入截图...'),
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-import');
          }
        },
        {
          label: T('exportAll', '导出全部...'),
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-export');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: T('edit', '编辑'),
      submenu: [
        { role: 'undo', label: labels?.undo },
        { role: 'redo', label: labels?.redo },
        { type: 'separator' },
        { role: 'cut', label: labels?.cut },
        { role: 'copy', label: labels?.copy },
        { role: 'paste', label: labels?.paste },
        { role: 'delete', label: labels?.delete },
        { role: 'selectAll', label: labels?.selectAll },
        { type: 'separator' },
        {
          label: T('startSpeaking', '语音听写'),
          role: 'startSpeaking'
        },
        {
          label: T('stopSpeaking', '停止朗读'),
          role: 'stopSpeaking'
        }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: T('view', '视图'),
      submenu: [
        { role: 'reload', label: labels?.reload },
        { role: 'forceReload', label: labels?.forceReload },
        { role: 'toggleDevTools', label: labels?.toggleDevTools },
        { type: 'separator' },
        { role: 'resetZoom', label: labels?.resetZoom },
        { role: 'zoomIn', label: labels?.zoomIn },
        { role: 'zoomOut', label: labels?.zoomOut },
        { type: 'separator' },
        { role: 'togglefullscreen', label: labels?.toggleFullscreen }
      ]
    },
    // { Mode Menu }
    {
      label: T('mode', '模式'),
      submenu: [
        {
          label: T('posterDesign', '海报设计 (Poster Design)'),
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-mode-screenshot');
          }
        },
        {
          label: T('iconDesign', '图标设计 (Icon Design)'),
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-mode-icon');
          }
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: T('window', '窗口'),
      submenu: [
        {
          label: T('showMainWindow', '显示主窗口'),
          click: () => {
            if (mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            } else {
              createWindow();
            }
          }
        },
        { type: 'separator' },
        { role: 'minimize', label: labels?.minimize },
        { role: 'zoom', label: labels?.zoom },
        { type: 'separator' },
        { role: 'front', label: labels?.front },
        { type: 'separator' },
        { role: 'window' }
      ]
    },
    {
      role: 'help',
      label: T('help', '帮助'),
      submenu: [
        {
          label: T('visitWebsite', '访问官网首页'),
          click: async () => {
            await shell.openExternal('https://hooosberg.github.io/GlotShot/');
          }
        },
        {
          label: T('visitGithub', '访问 GitHub 仓库'),
          click: async () => {
            await shell.openExternal('https://github.com/hooosberg/GlotShot');
          }
        },
        { type: 'separator' },
        {
          label: T('aboutDeveloper', '关于开发者 (hooosberg)'),
          click: async () => {
            await shell.openExternal('https://github.com/hooosberg');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  ipcMain.on('update-menu-language', (event, labels) => {
    createMenu(labels);
  });

  // IPC: Select Directory
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });

  // IPC: Read Directory Images (for background gallery)
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

  // IPC: Select Files (支持多选文件)
  ipcMain.handle('select-files', async (event, options) => {
    const { defaultPath, multiSelections = true, filters } = options || {};
    const result = await dialog.showOpenDialog({
      properties: ['openFile', ...(multiSelections ? ['multiSelections'] : [])],
      defaultPath,
      filters: filters || [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }]
    });
    return result.filePaths;
  });

  // IPC: Read specific files by paths
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

  // IPC: Save Files
  ipcMain.handle('save-files', async (event, { basePath, files }) => {
    try {
      if (!basePath) return { success: false, error: 'No base path provided' };

      for (const file of files) {
        const fullPath = path.join(basePath, file.path);
        const dir = path.dirname(fullPath);

        // Ensure directory exists
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write file (strip base64 header if present)
        const base64Data = file.data.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(fullPath, Buffer.from(base64Data, 'base64'));
      }
      return { success: true };
    } catch (e) {
      console.error('Save failed:', e);
      return { success: false, error: e.message };
    }
  });

  app.on('activate', () => {
    // macOS: 点击 Dock 图标时重新显示或创建窗口
    if (mainWindow) {
      // 窗口存在但可能被隐藏或最小化
      mainWindow.show();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      // 没有任何窗口，创建新窗口
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
