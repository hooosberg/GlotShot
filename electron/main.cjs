const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
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

app.whenReady().then(() => {
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
