const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    saveFiles: (data) => ipcRenderer.invoke('save-files', data),
    readDirectoryImages: (dirPath) => ipcRenderer.invoke('read-directory-images', dirPath),
    selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    readFiles: (filePaths) => ipcRenderer.invoke('read-files', filePaths),
    on: (channel, func) => {
        const validChannels = ['show-settings', 'show-about', 'menu-import', 'menu-export'];
        if (validChannels.includes(channel)) {
            // Strip event as it includes sender
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
