const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels
      let validChannels = [
        'navigate',
        'check-for-updates',
        'download-update',
        'install-update',
        'update-data-saver-menu'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      let validChannels = [
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
        'show-about',
        'show-notification',
        'check-internet-speed',
        'check-updates',
        'update-status'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (_, ...args) => func(...args));
      }
    },
    // Invoke methods in main process
    invoke: async (channel, data) => {
      let validChannels = ['get-app-path', 'get-network-info'];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, data);
      }
    }
  }
);
