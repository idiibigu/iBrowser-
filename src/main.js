const { app, BrowserWindow, session, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// Mock autoUpdater for testing
const autoUpdater = {
  autoDownload: false,
  autoInstallOnAppQuit: true,
  on: (event, callback) => {
    // تخزين معالجات الأحداث
    if (!autoUpdater.eventHandlers) {
      autoUpdater.eventHandlers = {};
    }
    autoUpdater.eventHandlers[event] = callback;
  },
  checkForUpdates: () => {
    console.log('التحقق من التحديثات...');

    // محاكاة التحقق من التحديثات
    if (autoUpdater.eventHandlers && autoUpdater.eventHandlers['checking-for-update']) {
      autoUpdater.eventHandlers['checking-for-update']();
    }

    // بعد ثانيتين، إرسال إشعار بعدم وجود تحديثات
    setTimeout(() => {
      if (autoUpdater.eventHandlers && autoUpdater.eventHandlers['update-not-available']) {
        autoUpdater.eventHandlers['update-not-available']({
          version: '1.0.4',
          releaseDate: new Date().toISOString()
        });
      }
    }, 2000);

    return Promise.resolve();
  },
  downloadUpdate: () => {
    console.log('تنزيل التحديث...');

    // محاكاة تقدم التنزيل
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (autoUpdater.eventHandlers && autoUpdater.eventHandlers['download-progress']) {
        autoUpdater.eventHandlers['download-progress']({
          percent: progress,
          bytesPerSecond: 1000000,
          total: 10000000,
          transferred: progress * 100000
        });
      }

      if (progress >= 100) {
        clearInterval(interval);

        if (autoUpdater.eventHandlers && autoUpdater.eventHandlers['update-downloaded']) {
          autoUpdater.eventHandlers['update-downloaded']({
            version: '1.0.5',
            releaseDate: new Date().toISOString(),
            releaseNotes: 'تحديث تجريبي للاختبار'
          });
        }
      }
    }, 500);

    return Promise.resolve();
  },
  quitAndInstall: () => {
    console.log('تثبيت التحديث وإعادة تشغيل التطبيق...');
    app.quit();
  }
};

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

// User data directory for persistent storage
const userDataPath = app.getPath('userData');
const sessionDataPath = path.join(userDataPath, 'session-data');

// Ensure the session data directory exists
if (!fs.existsSync(sessionDataPath)) {
  fs.mkdirSync(sessionDataPath, { recursive: true });
}

// Create the browser window
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'logo', 'worksuite-logo.png'),
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, 'preload.js'), // Use a preload script
      webviewTag: true, // Enable webview tag
      partition: 'persist:main', // Persist session data
      spellcheck: true
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Set Chrome as the user agent to ensure compatibility
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Enable persistent cookies and storage
  session.defaultSession.cookies.set({
    url: 'https://pms.idiibi.com',
    name: 'electron-app',
    value: 'true',
    expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year
  }).then(() => {
    console.log('Cookie set successfully');
  }).catch(err => {
    console.error('Failed to set cookie', err);
  });

  // Configure session for Google and Facebook login
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [
      'https://*.google.com/*',
      'https://*.googleapis.com/*',
      'https://*.facebook.com/*',
      'https://*.fbcdn.net/*'
    ]
  }, (details, callback) => {
    // Add required headers for OAuth flows
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    details.requestHeaders['Sec-Fetch-Site'] = 'cross-site';
    details.requestHeaders['Sec-Fetch-Mode'] = 'navigate';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create application menu
function createAppMenu() {
  // إزالة القائمة العلوية واستخدام القائمة المنسدلة بجانب البحث بدلاً منها
  Menu.setApplicationMenu(null);
}

// تكوين التحديثات التلقائية
function setupAutoUpdater() {
  // تعطيل التحقق التلقائي من التحديثات عند بدء التشغيل
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // استماع لأحداث التحديث
  autoUpdater.on('checking-for-update', () => {
    console.log('جاري التحقق من وجود تحديثات...');
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'checking',
        message: 'جاري التحقق من وجود تحديثات...'
      });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('يوجد تحديث جديد متاح:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'available',
        info: {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        }
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('لا يوجد تحديث جديد:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'not-available',
        info: {
          version: info.version,
          releaseDate: info.releaseDate
        }
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('تقدم التنزيل:', progressObj);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'downloading',
        progress: progressObj
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('تم تنزيل التحديث:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'downloaded',
        info: {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        }
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('خطأ في التحديث:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'error',
        error: err.message
      });
    }
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  createAppMenu();
  setupAutoUpdater();
  setupMenuIPCHandlers();

  // التحقق من التحديثات بعد 3 ثوانٍ من بدء التشغيل
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      console.error('خطأ في التحقق من التحديثات:', err);
    });
  }, 3000);

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer process
ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// Get network information
ipcMain.handle('get-network-info', async () => {
  try {
    // This is a simple implementation - in a real app, you might use a more sophisticated method
    const networkInfo = {
      downloadSpeed: Math.floor(Math.random() * 100) + 1, // Simulated download speed in Mbps
      uploadSpeed: Math.floor(Math.random() * 20) + 1, // Simulated upload speed in Mbps
      latency: Math.floor(Math.random() * 100) + 5, // Simulated latency in ms
      isOnline: true
    };
    return networkInfo;
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      downloadSpeed: 0,
      uploadSpeed: 0,
      latency: 0,
      isOnline: false
    };
  }
});

// Handle data saver mode updates from renderer
ipcMain.on('update-data-saver-menu', (_, enabled) => {
  // تحديث حالة وضع توفير البيانات في القائمة العلوية
  const menu = Menu.getApplicationMenu();
  if (menu) {
    // البحث عن عنصر القائمة وضع توفير البيانات
    const toolsMenu = menu.items.find(item => item.label === 'أدوات');
    if (toolsMenu && toolsMenu.submenu) {
      const internetSettingsItem = toolsMenu.submenu.items.find(item => item.label === 'إعدادات الإنترنت');
      if (internetSettingsItem && internetSettingsItem.submenu) {
        const dataSaverItem = internetSettingsItem.submenu.items.find(item => item.label === 'وضع توفير البيانات');
        if (dataSaverItem) {
          dataSaverItem.checked = enabled;
        }
      }
    }
  }
});

// Handle navigation events from renderer
ipcMain.on('navigate', (_, url) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('navigate-webview', url);
  }
});

// معالجات IPC للتحديثات
ipcMain.on('check-for-updates', () => {
  console.log('طلب التحقق من التحديثات من العملية الرئيسية');
  autoUpdater.checkForUpdates().catch(err => {
    console.error('خطأ في التحقق من التحديثات:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'error',
        error: err.message
      });
    }
  });
});

ipcMain.on('download-update', () => {
  console.log('طلب تنزيل التحديث من العملية الرئيسية');
  autoUpdater.downloadUpdate().catch(err => {
    console.error('خطأ في تنزيل التحديث:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'error',
        error: err.message
      });
    }
  });
});

ipcMain.on('install-update', () => {
  console.log('طلب تثبيت التحديث من العملية الرئيسية');
  autoUpdater.quitAndInstall();
});

// معالجات IPC للقائمة الجديدة
function setupMenuIPCHandlers() {
  // إنهاء التطبيق
  ipcMain.on('quit-app', () => {
    app.quit();
  });

  // تبديل وضع ملء الشاشة
  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // مسح الكاش
  ipcMain.on('clear-cache', () => {
    if (mainWindow) {
      session.defaultSession.clearCache().then(() => {
        mainWindow.webContents.send('show-notification', 'تم مسح الكاش بنجاح');
      });
    }
  });

  // مسح ملفات تعريف الارتباط
  ipcMain.on('clear-cookies', () => {
    if (mainWindow) {
      session.defaultSession.clearStorageData({ storages: ['cookies'] }).then(() => {
        mainWindow.webContents.send('show-notification', 'تم مسح ملفات تعريف الارتباط بنجاح');
      });
    }
  });

  // مسح كل البيانات
  ipcMain.on('clear-all-data', () => {
    if (mainWindow) {
      session.defaultSession.clearStorageData().then(() => {
        mainWindow.webContents.send('show-notification', 'تم مسح جميع بيانات التصفح بنجاح');
      });
    }
  });

  // فتح صفحة في نافذة جديدة
  ipcMain.on('open-page', (_, data) => {
    const { page } = data;
    const pageUrl = path.join(__dirname, 'pages', page);

    // إنشاء نافذة جديدة للصفحة
    let pageWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, 'assets', 'logo', 'worksuite-logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'pages', 'preload.js')
      }
    });

    // تحميل الصفحة
    pageWindow.loadFile(pageUrl);

    // إضافة عنوان للنافذة الجديدة
    switch(page) {
      case 'user-guide.html':
        pageWindow.setTitle('دليل المستخدم - iBrowser');
        break;
      case 'faq.html':
        pageWindow.setTitle('الأسئلة الشائعة - iBrowser');
        break;
      case 'check-updates.html':
        pageWindow.setTitle('التحقق من التحديثات - iBrowser');
        break;
      case 'about.html':
        pageWindow.setTitle('حول البرنامج - iBrowser');
        break;
      default:
        pageWindow.setTitle('iBrowser');
    }

    // إزالة القائمة من النافذة
    pageWindow.setMenu(null);

    // تنظيف عند إغلاق النافذة
    pageWindow.on('closed', () => {
      pageWindow = null;
    });
  });
}
