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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset', // Mac-style title bar
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: '关于 GlotShot',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('show-about');
          }
        },
        { type: 'separator' },
        {
          label: '设置...',
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
      label: '文件',
      submenu: [
        {
          label: '导入截图...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-import');
          }
        },
        {
          label: '导出全部...',
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
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'delete', label: '删除' },
        { role: 'selectAll', label: '全选' },
        { type: 'separator' },
        {
          label: '语音听写',
          role: 'startSpeaking'
        },
        {
          label: '停止朗读',
          role: 'stopSpeaking'
        }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { Mode Menu }
    {
      label: '模式',
      submenu: [
        {
          label: '海报设计 (Poster Design)',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-mode-screenshot');
          }
        },
        {
          label: '图标设计 (Icon Design)',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-mode-icon');
          }
        }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ]
    },
    {
      role: 'help',
      label: '帮助',
      submenu: [
        {
          label: '访问 GitHub 仓库',
          click: async () => {
            await shell.openExternal('https://github.com/hooosberg/GlotShot');
          }
        },
        {
          label: '关于开发者 (hooosberg)',
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
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
