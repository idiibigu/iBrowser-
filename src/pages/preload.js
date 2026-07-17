const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ibrowser', {
  updates: {
    check: () => ipcRenderer.invoke('updates:check'),
    openRelease: (url) => ipcRenderer.send('updates:open-release', url)
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    openExternal: (url) => ipcRenderer.send('shell:open-external', url)
  }
});
