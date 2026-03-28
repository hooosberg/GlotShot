const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    saveFiles: (data) => ipcRenderer.invoke('save-files', data),
    readDirectoryImages: (dirPath) => ipcRenderer.invoke('read-directory-images', dirPath),
    selectFiles: (options) => ipcRenderer.invoke('select-files', options),
    readFiles: (filePaths) => ipcRenderer.invoke('read-files', filePaths),
    openProjectFile: () => ipcRenderer.invoke('project:open'),
    saveProjectFile: (payload) => ipcRenderer.invoke('project:save', payload),
    saveProjectFileAs: (payload) => ipcRenderer.invoke('project:save-as', payload),
    respondProjectSaveBeforeClose: (payload) => ipcRenderer.send('project:save-before-close-result', payload),
    updateWindowState: (payload) => ipcRenderer.invoke('window:set-state', payload),
    updateMenuLanguage: (menuData) => ipcRenderer.send('update-menu-language', menuData),
    getAppLocale: () => ipcRenderer.invoke('get-app-locale'),
    on: (channel, func) => {
        const validChannels = [
            'show-settings',
            'show-about',
            'menu-project-new',
            'menu-project-open',
            'menu-project-save',
            'menu-project-save-as',
            'project-save-before-close',
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

contextBridge.exposeInMainWorld('license', {
    checkStatus: () => ipcRenderer.invoke('license:check-status'),
    purchasePro: () => ipcRenderer.invoke('license:purchase-pro'),
    restorePurchases: () => ipcRenderer.invoke('license:restore-purchases'),
});
