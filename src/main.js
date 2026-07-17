const { app, BrowserWindow, session, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const { SettingsStore, SEARCH_ENGINES } = require('./core/settings');
const PluginManager = require('./core/plugin-manager');
const updater = require('./core/updater');

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;
let settings;
let pluginManager;

// User data directory for persistent storage
const userDataPath = app.getPath('userData');
const sessionDataPath = path.join(userDataPath, 'session-data');

// Ensure the session data directory exists
if (!fs.existsSync(sessionDataPath)) {
  fs.mkdirSync(sessionDataPath, { recursive: true });
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'logo', 'worksuite-logo.png'),
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // Enable webview tag
      partition: 'persist:main', // Persist session data
      spellcheck: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Electron only allows a single onBeforeSendHeaders listener per session,
  // so every header rule (user agent, OAuth headers, Do Not Track) is
  // combined here instead of being registered in separate calls.
  const oauthHosts = /\.(google|googleapis|facebook|fbcdn)\.(com|net)$/i;
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    try {
      const host = new URL(details.url).hostname;
      if (oauthHosts.test(host)) {
        details.requestHeaders['Sec-Fetch-Site'] = 'cross-site';
        details.requestHeaders['Sec-Fetch-Mode'] = 'navigate';
      }
    } catch (err) {
      // Ignore malformed URLs; the default headers still apply.
    }

    if (settings.get('privacy.doNotTrack', true)) {
      details.requestHeaders['DNT'] = '1';
    }

    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// No native/top menu bar - the app ships its own in-window menu and settings UI
function createAppMenu() {
  Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
  settings = new SettingsStore();
  pluginManager = new PluginManager(settings);

  createWindow();
  createAppMenu();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function registerIpcHandlers() {
  // ---- App info ----
  ipcMain.handle('get-app-path', () => app.getAppPath());
  ipcMain.handle('app:get-version', () => app.getVersion());

  // ---- Settings ----
  ipcMain.handle('settings:get-all', () => settings.getAll());
  ipcMain.handle('settings:get', (_, keyPath, fallback) => settings.get(keyPath, fallback));
  ipcMain.handle('settings:set', (_, keyPath, value) => settings.set(keyPath, value));
  ipcMain.handle('settings:search-engines', () => SEARCH_ENGINES);

  // ---- Plugins / extensions ----
  ipcMain.handle('plugins:list', () => pluginManager.list());
  ipcMain.handle('plugins:set-enabled', (_, id, enabled) => pluginManager.setEnabled(id, enabled));
  ipcMain.handle('plugins:get-source', (_, id) => pluginManager.readSource(id));
  ipcMain.handle('plugins:storage-get', (_, id, key, fallback) => pluginManager.storageGet(id, key, fallback));
  ipcMain.handle('plugins:storage-set', (_, id, key, value) => pluginManager.storageSet(id, key, value));
  ipcMain.on('plugins:open-folder', () => pluginManager.openUserPluginsFolder());

  // ---- Updates (real GitHub Releases check, replaces the old fake updater) ----
  ipcMain.handle('updates:check', () => updater.checkForUpdates());
  ipcMain.on('updates:open-release', (_, url) => updater.openReleasePage(url));

  // ---- External links / shell ----
  ipcMain.on('shell:open-external', (_, url) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
  });

  // ---- Navigation from menu/plugins into the active tab ----
  ipcMain.on('navigate', (_, url) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('navigate-webview', url);
    }
  });

  // ---- Window / app controls ----
  ipcMain.on('quit-app', () => app.quit());

  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // ---- Privacy / data controls ----
  ipcMain.on('clear-cache', () => {
    if (!mainWindow) return;
    session.defaultSession.clearCache().then(() => {
      mainWindow.webContents.send('show-notification', 'تم مسح الكاش بنجاح');
    });
  });

  ipcMain.on('clear-cookies', () => {
    if (!mainWindow) return;
    session.defaultSession.clearStorageData({ storages: ['cookies'] }).then(() => {
      mainWindow.webContents.send('show-notification', 'تم مسح ملفات تعريف الارتباط بنجاح');
    });
  });

  ipcMain.on('clear-all-data', () => {
    if (!mainWindow) return;
    session.defaultSession.clearStorageData().then(() => {
      mainWindow.webContents.send('show-notification', 'تم مسح جميع بيانات التصفح بنجاح');
    });
  });

  // ---- Secondary windows (help/about/etc.) ----
  ipcMain.on('open-page', (_, data) => {
    const { page } = data || {};
    if (typeof page !== 'string' || !/^[\w-]+\.html$/.test(page)) return;

    const pageUrl = path.join(__dirname, 'pages', page);
    if (!fs.existsSync(pageUrl)) return;

    const pageWindow = new BrowserWindow({
      width: 820,
      height: 640,
      icon: path.join(__dirname, 'assets', 'logo', 'worksuite-logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'pages', 'preload.js')
      }
    });

    pageWindow.loadFile(pageUrl);
    pageWindow.setMenu(null);

    const titles = {
      'user-guide.html': 'دليل المستخدم - iBrowser',
      'faq.html': 'الأسئلة الشائعة - iBrowser',
      'check-updates.html': 'التحقق من التحديثات - iBrowser',
      'about.html': 'حول البرنامج - iBrowser'
    };
    pageWindow.setTitle(titles[page] || 'iBrowser');
  });
}
