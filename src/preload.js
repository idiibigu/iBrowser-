const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object (contextIsolation-safe).
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validChannels = [
      'navigate',
      'quit-app',
      'toggle-fullscreen',
      'clear-cache',
      'clear-cookies',
      'clear-all-data',
      'open-page',
      'shell:open-external',
      'plugins:open-folder',
      'updates:open-release'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = [
      'navigate-webview',
      'navigate-menu',
      'new-tab',
      'close-tab',
      'go-back',
      'go-forward',
      'reload-page',
      'stop-loading',
      'save-page',
      'print-page',
      'find-in-page',
      'reader-mode',
      'dark-mode',
      'show-payment',
      'show-notification'
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
  invoke: async (channel, ...args) => {
    const validChannels = [
      'get-app-path',
      'app:get-version',
      'settings:get-all',
      'settings:get',
      'settings:set',
      'settings:search-engines',
      'plugins:list',
      'plugins:set-enabled',
      'plugins:get-source',
      'plugins:storage-get',
      'plugins:storage-set',
      'updates:check'
    ];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
  }
});

// High-level namespaced API for app UI (settings, plugins, updates).
// Built on top of the raw `api` bridge above so callers don't need to know
// IPC channel names.
contextBridge.exposeInMainWorld('ibrowser', {
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    get: (keyPath, fallback) => ipcRenderer.invoke('settings:get', keyPath, fallback),
    set: (keyPath, value) => ipcRenderer.invoke('settings:set', keyPath, value),
    searchEngines: () => ipcRenderer.invoke('settings:search-engines')
  },
  plugins: {
    list: () => ipcRenderer.invoke('plugins:list'),
    setEnabled: (id, enabled) => ipcRenderer.invoke('plugins:set-enabled', id, enabled),
    getSource: (id) => ipcRenderer.invoke('plugins:get-source', id),
    storageGet: (id, key, fallback) => ipcRenderer.invoke('plugins:storage-get', id, key, fallback),
    storageSet: (id, key, value) => ipcRenderer.invoke('plugins:storage-set', id, key, value),
    openFolder: () => ipcRenderer.send('plugins:open-folder')
  },
  updates: {
    check: () => ipcRenderer.invoke('updates:check'),
    openRelease: (url) => ipcRenderer.send('updates:open-release', url)
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    openExternal: (url) => ipcRenderer.send('shell:open-external', url)
  }
});
