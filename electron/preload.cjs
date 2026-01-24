const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    saveFiles: (data) => ipcRenderer.invoke('save-files', data),
    readDirectoryImages: (dirPath) => ipcRenderer.invoke('read-directory-images', dirPath),
    selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    readFiles: (filePaths) => ipcRenderer.invoke('read-files', filePaths),
    updateMenuLanguage: (menuData) => ipcRenderer.send('update-menu-language', menuData),
    getAppLocale: () => ipcRenderer.invoke('get-app-locale'),
    on: (channel, func) => {
        const validChannels = [
            'show-settings',
            'show-about',
            'menu-import',
            'menu-export-language',
            'menu-export-device',
            'menu-mode-screenshot',
            'menu-mode-icon'
        ];
        if (validChannels.includes(channel)) {
            // Strip event as it includes sender
            const subscription = (event, ...args) => func(...args);
            ipcRenderer.on(channel, subscription);
            // Return cleanup function
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }
    }
});
