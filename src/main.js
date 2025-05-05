const { app, BrowserWindow, session, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// const { autoUpdater } = require('electron-updater');
// Mock autoUpdater for testing
const autoUpdater = {
  autoDownload: false,
  autoInstallOnAppQuit: true,
  on: (event, callback) => {},
  checkForUpdates: () => Promise.resolve(),
  downloadUpdate: () => Promise.resolve(),
  quitAndInstall: () => {}
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
  const template = [
    {
      label: 'الملف',
      submenu: [
        {
          label: 'الرئيسية',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://pms.idiibi.com/');
          }
        },
        { type: 'separator' },
        {
          label: 'تبويب جديد',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('new-tab');
          }
        },
        {
          label: 'إغلاق التبويب',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('close-tab');
          }
        },
        {
          label: 'حفظ الصفحة',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-page');
          }
        },
        {
          label: 'طباعة',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('print-page');
          }
        },
        { type: 'separator' },
        { role: 'quit', label: 'خروج' }
      ]
    },
    {
      label: 'تحرير',
      submenu: [
        { role: 'undo', label: 'تراجع' },
        { role: 'redo', label: 'إعادة' },
        { type: 'separator' },
        { role: 'cut', label: 'قص' },
        { role: 'copy', label: 'نسخ' },
        { role: 'paste', label: 'لصق' },
        { role: 'delete', label: 'حذف' },
        { type: 'separator' },
        { role: 'selectAll', label: 'تحديد الكل' },
        { type: 'separator' },
        {
          label: 'بحث في الصفحة',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('find-in-page');
          }
        }
      ]
    },
    {
      label: 'عرض',
      submenu: [
        { role: 'reload', label: 'تحديث' },
        { role: 'forceReload', label: 'تحديث إجباري' },
        { role: 'toggleDevTools', label: 'أدوات المطور' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'حجم طبيعي' },
        { role: 'zoomIn', label: 'تكبير' },
        { role: 'zoomOut', label: 'تصغير' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'ملء الشاشة' },
        { type: 'separator' },
        {
          label: 'وضع القراءة',
          click: () => {
            mainWindow.webContents.send('reader-mode');
          }
        },
        {
          label: 'وضع الليل',
          click: () => {
            mainWindow.webContents.send('dark-mode');
          }
        }
      ]
    },
    {
      label: 'تنقل',
      submenu: [
        {
          label: 'الرجوع',
          accelerator: 'Alt+Left',
          click: () => {
            mainWindow.webContents.send('go-back');
          }
        },
        {
          label: 'التقدم',
          accelerator: 'Alt+Right',
          click: () => {
            mainWindow.webContents.send('go-forward');
          }
        },
        {
          label: 'إعادة تحميل',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('reload-page');
          }
        },
        {
          label: 'إيقاف التحميل',
          accelerator: 'Escape',
          click: () => {
            mainWindow.webContents.send('stop-loading');
          }
        },
        { type: 'separator' },
        {
          label: 'الرئيسية',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://pms.idiibi.com/');
          }
        },
        {
          label: 'خدماتنا',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/services.html');
          }
        },
        {
          label: 'من نحن',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/about.html');
          }
        },
        {
          label: 'المشاريع',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/projects.html');
          }
        },
        {
          label: 'اتصل بنا',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/contact.html');
          }
        },
        {
          label: 'الدعم عن بعد',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/anydesk-support.html');
          }
        },
        { type: 'separator' },
        {
          label: 'طرق الدفع',
          click: () => {
            mainWindow.webContents.send('show-payment');
          }
        }
      ]
    },
    {
      label: 'أدوات',
      submenu: [
        {
          label: 'مسح بيانات التصفح',
          submenu: [
            {
              label: 'مسح الكاش',
              click: () => {
                session.defaultSession.clearCache().then(() => {
                  mainWindow.webContents.send('show-notification', 'تم مسح الكاش بنجاح');
                });
              }
            },
            {
              label: 'مسح ملفات تعريف الارتباط',
              click: () => {
                session.defaultSession.clearStorageData({ storages: ['cookies'] }).then(() => {
                  mainWindow.webContents.send('show-notification', 'تم مسح ملفات تعريف الارتباط بنجاح');
                });
              }
            },
            {
              label: 'مسح بيانات المواقع',
              click: () => {
                session.defaultSession.clearStorageData({ storages: ['localstorage', 'sessionstorage'] }).then(() => {
                  mainWindow.webContents.send('show-notification', 'تم مسح بيانات المواقع بنجاح');
                });
              }
            },
            {
              label: 'مسح كل البيانات',
              click: () => {
                session.defaultSession.clearStorageData().then(() => {
                  mainWindow.webContents.send('show-notification', 'تم مسح جميع بيانات التصفح بنجاح');
                });
              }
            }
          ]
        },
        {
          label: 'إعدادات الكاش',
          submenu: [
            {
              label: 'تفعيل الكاش',
              type: 'checkbox',
              checked: true,
              click: (menuItem) => {
                mainWindow.webContents.session.setCacheEnabled(menuItem.checked);
                mainWindow.webContents.send('show-notification', menuItem.checked ? 'تم تفعيل الكاش' : 'تم تعطيل الكاش');
              }
            },
            {
              label: 'تحديد حجم الكاش',
              submenu: [
                {
                  label: '100 ميجابايت',
                  type: 'radio',
                  checked: false,
                  click: () => {
                    app.commandLine.appendSwitch('disk-cache-size', (100 * 1024 * 1024).toString());
                    mainWindow.webContents.send('show-notification', 'تم تحديد حجم الكاش: 100 ميجابايت');
                  }
                },
                {
                  label: '500 ميجابايت',
                  type: 'radio',
                  checked: true,
                  click: () => {
                    app.commandLine.appendSwitch('disk-cache-size', (500 * 1024 * 1024).toString());
                    mainWindow.webContents.send('show-notification', 'تم تحديد حجم الكاش: 500 ميجابايت');
                  }
                },
                {
                  label: '1 جيجابايت',
                  type: 'radio',
                  checked: false,
                  click: () => {
                    app.commandLine.appendSwitch('disk-cache-size', (1024 * 1024 * 1024).toString());
                    mainWindow.webContents.send('show-notification', 'تم تحديد حجم الكاش: 1 جيجابايت');
                  }
                }
              ]
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'إعدادات الإنترنت',
          submenu: [
            {
              label: 'وضع توفير البيانات',
              type: 'checkbox',
              checked: false,
              click: (menuItem) => {
                // تحديث حالة وضع توفير البيانات في localStorage
                mainWindow.webContents.executeJavaScript(`
                  localStorage.setItem('data_saver_mode', ${menuItem.checked ? "'enabled'" : "'disabled'"});
                  // تطبيق وضع توفير البيانات على الويب فيو الحالي
                  if (${menuItem.checked}) {
                    const activeWebview = document.querySelector('.tab-pane.active webview');
                    if (activeWebview) {
                      window.toggleDataSaverMode();
                    }
                  } else {
                    const activeWebview = document.querySelector('.tab-pane.active webview');
                    if (activeWebview) {
                      activeWebview.reload();
                    }
                  }
                `);
                mainWindow.webContents.send('show-notification', menuItem.checked ? 'تم تفعيل وضع توفير البيانات' : 'تم تعطيل وضع توفير البيانات');
              }
            },
            {
              label: 'تحميل الصور',
              type: 'checkbox',
              checked: true,
              click: (menuItem) => {
                mainWindow.webContents.session.setImagesEnabled(menuItem.checked);
                mainWindow.webContents.send('show-notification', menuItem.checked ? 'تم تفعيل تحميل الصور' : 'تم تعطيل تحميل الصور');
              }
            },
            {
              label: 'تحميل JavaScript',
              type: 'checkbox',
              checked: true,
              click: (menuItem) => {
                mainWindow.webContents.session.setJavaScriptEnabled(menuItem.checked);
                mainWindow.webContents.send('show-notification', menuItem.checked ? 'تم تفعيل JavaScript' : 'تم تعطيل JavaScript');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'فحص سرعة الإنترنت',
          click: () => {
            mainWindow.webContents.send('check-internet-speed');
          }
        }
      ]
    },
    {
      role: 'help',
      label: 'مساعدة',
      submenu: [
        {
          label: 'دليل المستخدم',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/help.html');
          }
        },
        {
          label: 'الأسئلة الشائعة',
          click: () => {
            mainWindow.webContents.send('navigate-menu', 'https://idiibi.com/faq.html');
          }
        },
        { type: 'separator' },
        {
          label: 'التحقق من التحديثات',
          click: () => {
            // فتح صفحة التحقق من التحديثات
            mainWindow.webContents.send('navigate-menu', 'pages/check-updates.html');
          }
        },
        {
          label: 'حول البرنامج',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
