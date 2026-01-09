const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    saveFiles: (data) => ipcRenderer.invoke('save-files', data),
    readDirectoryImages: (dirPath) => ipcRenderer.invoke('read-directory-images', dirPath),
    selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    readFiles: (filePaths) => ipcRenderer.invoke('read-files', filePaths)
});
