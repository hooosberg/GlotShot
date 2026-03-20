const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5187/app.html';

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
    console.log('Loading dev renderer:', devServerUrl);
    mainWindow.loadURL(devServerUrl);
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
    console.log('Page loaded successfully:', mainWindow.webContents.getURL());
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
        { role: 'services', label: T('services', '服务') },
        { type: 'separator' },
        { role: 'hide', label: T('hide', '隐藏 GlotShot') },
        { role: 'hideOthers', label: T('hideOthers', '隐藏其他') },
        { role: 'unhide', label: T('showAll', '显示全部') },
        { type: 'separator' },
        { role: 'quit', label: T('quit', '退出 GlotShot') }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: T('file', '文件'),
      submenu: [
        {
          label: T('newWindow', '新建窗口'),
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              if (mainWindow.isMinimized()) mainWindow.restore();
              mainWindow.show();
              mainWindow.focus();
            } else {
              createWindow();
            }
          }
        },
        {
          label: T('importScreenshots', '导入截图...'),
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-import');
          }
        },
        {
          label: T('export', '导出'),
          submenu: [
            {
              label: T('exportByLanguage', '按语言导出...'),
              accelerator: 'CmdOrCtrl+E',
              click: () => {
                if (mainWindow) mainWindow.webContents.send('menu-export-language');
              }
            },
            {
              label: T('exportByDevice', '按设备导出...'),
              accelerator: 'CmdOrCtrl+Shift+E',
              click: () => {
                if (mainWindow) mainWindow.webContents.send('menu-export-device');
              }
            }
          ]
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: T('close', '关闭窗口') } : { role: 'quit', label: T('quit', '退出') }
      ]
    },
    // { role: 'editMenu' }
    {
      label: T('edit', '编辑'),
      submenu: [
        { role: 'undo', label: T('undo', '撤销') },
        { role: 'redo', label: T('redo', '重做') },
        { type: 'separator' },
        { role: 'cut', label: T('cut', '剪切') },
        { role: 'copy', label: T('copy', '复制') },
        { role: 'paste', label: T('paste', '粘贴') },
        { role: 'delete', label: T('delete', '删除') },
        { role: 'selectAll', label: T('selectAll', '全选') },
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
        { role: 'reload', label: T('reload', '重新加载') },
        { role: 'forceReload', label: T('forceReload', '强制重新加载') },
        { role: 'toggleDevTools', label: T('toggleDevTools', '切换开发者工具') },
        { type: 'separator' },
        { role: 'resetZoom', label: T('resetZoom', '重置缩放') },
        { role: 'zoomIn', label: T('zoomIn', '放大') },
        { role: 'zoomOut', label: T('zoomOut', '缩小') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: T('toggleFullscreen', '切换全屏') }
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
        { role: 'minimize', label: T('minimize', '最小化') },
        { role: 'zoom', label: T('zoom', '缩放') },
        { type: 'separator' },
        { role: 'front', label: T('front', '前置全部窗口') },
        { type: 'separator' },
        { role: 'window', label: T('window', '窗口') }
      ]
    },
    // { role: 'help' }
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
  app.setName('GlotShot');
  createMenu();
  createWindow();

  ipcMain.on('update-menu-language', (event, labels) => {
    createMenu(labels);
  });

  // IPC: Get App Locale
  ipcMain.handle('get-app-locale', () => {
    return app.getLocale();
  });

  // IPC: Select Directory
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      title: '选择导出保存位置',
      buttonLabel: '选择',
      defaultPath: app.getPath('downloads'),
      properties: ['openDirectory', 'createDirectory']
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
