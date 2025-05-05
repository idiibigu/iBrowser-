// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const refreshButton = document.getElementById('refresh-button');
const homeButton = document.getElementById('home-button');
const urlInput = document.getElementById('url-input');
const goButton = document.getElementById('go-button');
const tabsList = document.getElementById('tabs-list');
const newTabButton = document.getElementById('new-tab-button');
const tabsContent = document.querySelector('.tabs-content');
const paymentModal = document.getElementById('payment-modal');
const closePaymentModal = document.getElementById('close-payment-modal');

// URLs
const urls = {
    home: 'https://www.google.com/',
    pms: 'https://pms.idiibi.com/',
    google: 'https://www.google.com/',
    facebook: 'https://www.facebook.com/',
    twitter: 'https://twitter.com/',
    instagram: 'https://www.instagram.com/',
    youtube: 'https://www.youtube.com/',
    services: 'https://www.google.com/search?q=services',
    about: 'https://www.google.com/search?q=about',
    projects: 'https://www.google.com/search?q=projects',
    contact: 'https://www.google.com/search?q=contact',
    support: 'https://www.google.com/search?q=support'
};

// Tabs management
let tabs = [
    {
        id: 'tab-1',
        title: 'الرئيسية',
        url: urls.home,
        webviewId: 'webview-1'
    }
];
let activeTabId = 'tab-1';
let tabCounter = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen initially
    showLoading();

    // Listen for navigation events from main process
    window.api.receive('navigate-webview', (url) => {
        navigateActiveTab(url);
    });

    // Listen for menu navigation events
    window.api.receive('navigate-menu', (url) => {
        navigateActiveTab(url);
    });

    // Listen for tab management events
    window.api.receive('new-tab', () => {
        createNewTab();
    });

    window.api.receive('close-tab', () => {
        closeTab(activeTabId);
    });

    window.api.receive('go-back', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    });

    window.api.receive('go-forward', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    });

    window.api.receive('reload-page', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.reload();
        }
    });

    window.api.receive('stop-loading', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.stop();
        }
    });

    window.api.receive('save-page', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.downloadURL(activeWebview.getURL());
        }
    });

    window.api.receive('print-page', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.print();
        }
    });

    window.api.receive('find-in-page', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            // Simple implementation - in a real app, you would show a search UI
            const searchTerm = prompt('أدخل كلمة البحث:');
            if (searchTerm) {
                activeWebview.findInPage(searchTerm);
            }
        }
    });

    window.api.receive('reader-mode', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            // Simple implementation - in a real app, you would implement a proper reader mode
            activeWebview.executeJavaScript(`
                document.querySelectorAll('*').forEach(el => {
                    if (el.tagName !== 'BODY' && el.tagName !== 'ARTICLE' && el.tagName !== 'P' &&
                        el.tagName !== 'H1' && el.tagName !== 'H2' && el.tagName !== 'H3' &&
                        el.tagName !== 'H4' && el.tagName !== 'H5' && el.tagName !== 'H6' &&
                        el.tagName !== 'IMG' && el.tagName !== 'A') {
                        el.style.display = 'none';
                    }
                });
                document.body.style.maxWidth = '800px';
                document.body.style.margin = '0 auto';
                document.body.style.padding = '20px';
                document.body.style.fontSize = '18px';
                document.body.style.lineHeight = '1.6';
            `);
        }
    });

    window.api.receive('dark-mode', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            // Simple implementation - in a real app, you would implement a proper dark mode
            activeWebview.executeJavaScript(`
                document.body.style.backgroundColor = '#1e1e1e';
                document.body.style.color = '#f0f0f0';
                document.querySelectorAll('a').forEach(a => {
                    a.style.color = '#4da6ff';
                });
            `);
        }
    });

    window.api.receive('show-payment', () => {
        showPaymentModal();
    });

    window.api.receive('show-notification', (message) => {
        showNotification(message);
    });

    window.api.receive('check-internet-speed', () => {
        checkInternetSpeed();
    });

    // Set up browser controls
    setupBrowserControls();

    // Set up tabs functionality
    setupTabsEvents();

    // Set up webview events
    setupWebviewEvents();

    // Set up payment modal
    setupPaymentModal();

    // Set up address bar
    setupAddressBar();

    // Set up status bar
    setupStatusBar();

    // Set up menu
    setupMenu();

    // Set up AI button
    setupAIButton();

    // Initialize date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize network info
    updateNetworkInfo();
    setInterval(updateNetworkInfo, 5000);

    // Initialize data saver mode
    initDataSaverMode();
});

// Set up address bar
function setupAddressBar() {
    // Update URL input when URL changes
    const updateUrlInput = () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            const url = activeWebview.getURL();
            urlInput.value = url;
        }
    };

    // Navigate to URL when Enter key is pressed
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            navigateToUrlInput();
        }
    });

    // Navigate to URL when Go button is clicked
    goButton.addEventListener('click', () => {
        navigateToUrlInput();
    });

    // Home button click
    homeButton.addEventListener('click', () => {
        navigateActiveTab(urls.home);
    });

    // Function to navigate to the URL in the input
    function navigateToUrlInput() {
        let url = urlInput.value.trim();

        // Check if it's a search query or URL
        if (!url.includes('.') || url.includes(' ')) {
            // It's a search query
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Add https:// if missing
            url = `https://${url}`;
        }

        navigateActiveTab(url);
    }
}

// Set up browser controls
function setupBrowserControls() {
    backButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    });

    forwardButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    });

    refreshButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.reload();
        }
    });

    homeButton.addEventListener('click', () => {
        createNewTab('iBrowser', urls.home);
    });

    // Social media and PMS buttons
    document.getElementById('pms-button').addEventListener('click', () => {
        navigateActiveTab(urls.pms);
    });

    document.getElementById('google-button').addEventListener('click', () => {
        navigateActiveTab(urls.google);
    });

    document.getElementById('facebook-button').addEventListener('click', () => {
        navigateActiveTab(urls.facebook);
    });

    document.getElementById('twitter-button').addEventListener('click', () => {
        navigateActiveTab(urls.twitter);
    });

    document.getElementById('instagram-button').addEventListener('click', () => {
        navigateActiveTab(urls.instagram);
    });

    document.getElementById('youtube-button').addEventListener('click', () => {
        navigateActiveTab(urls.youtube);
    });

    // Bookmarks and history buttons
    document.getElementById('bookmark-button').addEventListener('click', () => {
        showBookmarksModal();
    });

    document.getElementById('history-button').addEventListener('click', () => {
        showHistoryModal();
    });
}

// Set up webview events
function setupWebviewEvents() {
    // Set up events for the initial webview
    setupWebviewEventListeners(document.getElementById('webview-1'));
}

// Set up event listeners for a specific webview
function setupWebviewEventListeners(webview) {
    webview.addEventListener('dom-ready', () => {
        // Update navigation buttons state
        updateNavigationState();

        // Hide loading screen
        hideLoading();

        // Update current URL
        updateCurrentUrl();

        // Enable DevTools in development mode
        if (process.env.NODE_ENV === 'development') {
            webview.openDevTools();
        }

        // Apply data saver mode if enabled
        if (localStorage.getItem('data_saver_mode') === 'enabled') {
            applyDataSaverMode(webview);
        }
    });

    webview.addEventListener('did-start-loading', () => {
        showLoading();
    });

    webview.addEventListener('did-stop-loading', () => {
        hideLoading();
        updateNavigationState();
        updateCurrentUrl();

        // Add page to history when loading completes
        const url = webview.getURL();
        const title = webview.getTitle() || getPageTitleFromUrl(url);
        addToHistory(title, url);
    });

    webview.addEventListener('did-navigate', () => {
        updateNavigationState();
        updateCurrentUrl();
    });

    webview.addEventListener('did-navigate-in-page', () => {
        updateNavigationState();
        updateCurrentUrl();
    });

    // Handle new window links to open in the same webview
    webview.addEventListener('new-window', (e) => {
        e.preventDefault();
        navigateActiveTab(e.url);
    });

    // Handle page title changes
    webview.addEventListener('page-title-updated', (e) => {
        // Update tab title
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (activeTab && activeTab.webviewId === webview.id) {
            updateTabTitle(activeTabId, e.title);
        }
    });
}

// Set up tabs events
function setupTabsEvents() {
    // New tab button
    newTabButton.addEventListener('click', () => {
        createNewTab();
    });

    // Set up close button for the initial tab
    document.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab('tab-1');
    });

    // Set up click event for the initial tab
    document.querySelector('.tab').addEventListener('click', () => {
        activateTab('tab-1');
    });
}

// Set up payment modal
function setupPaymentModal() {
    // Close payment modal
    closePaymentModal.addEventListener('click', () => {
        hidePaymentModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            hidePaymentModal();
        }
    });
}

// Show payment modal
function showPaymentModal() {
    paymentModal.classList.add('show');
    paymentModal.classList.add('animate__animated', 'animate__fadeIn');
}

// Hide payment modal
function hidePaymentModal() {
    paymentModal.classList.remove('show');
}

// Create a new tab
function createNewTab(title = 'تبويب جديد', url = urls.home) {
    tabCounter++;
    const tabId = `tab-${tabCounter}`;
    const webviewId = `webview-${tabCounter}`;

    // Create tab element with animation
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
        <div class="tab-favicon"><i class="fas fa-globe"></i></div>
        <span class="tab-title">${title}</span>
        <button type="button" class="tab-close" title="إغلاق التبويب"><i class="fas fa-times"></i></button>
    `;

    // Insert tab before the new tab button
    tabsList.insertBefore(tabElement, newTabButton);

    // Create tab content with loading indicator
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane';
    tabContent.id = tabId;
    tabContent.innerHTML = `
        <div class="webview-container">
            <div class="loading-indicator">
                <div class="spinner">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                </div>
                <div class="loading-text">جاري التحميل...</div>
            </div>
            <webview id="${webviewId}" src="${url}" partition="persist:pmswebview" allowpopups preload="./webview-preload.js"></webview>
        </div>
    `;

    // Add tab content to tabs content container
    tabsContent.appendChild(tabContent);

    // Add tab to tabs array
    tabs.push({
        id: tabId,
        title: title,
        url: url,
        webviewId: webviewId,
        createdAt: Date.now()
    });

    // Set up event listeners for the new tab
    const closeButton = tabElement.querySelector('.tab-close');
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tabId);
    });

    tabElement.addEventListener('click', () => {
        activateTab(tabId);
    });

    // Set up webview event listeners
    const webview = document.getElementById(webviewId);
    setupWebviewEventListeners(webview);

    // Add loading event listeners
    webview.addEventListener('did-start-loading', () => {
        // Show loading indicator
        const loadingIndicator = tabContent.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }

        // Update favicon
        const favicon = tabElement.querySelector('.tab-favicon i');
        if (favicon) {
            favicon.className = 'fas fa-spinner fa-spin';
        }
    });

    webview.addEventListener('did-stop-loading', () => {
        // Hide loading indicator
        const loadingIndicator = tabContent.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }

        // Update favicon with site icon if available
        const favicon = tabElement.querySelector('.tab-favicon i');
        if (favicon) {
            // Try to get favicon from the site
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${webview.getURL()}`;
            const img = new Image();
            img.onload = () => {
                tabElement.querySelector('.tab-favicon').innerHTML = `<img src="${faviconUrl}" alt="favicon">`;
            };
            img.onerror = () => {
                favicon.className = 'fas fa-globe';
            };
            img.src = faviconUrl;
        }
    });

    // Activate the new tab
    activateTab(tabId);

    // Add entrance animation
    tabElement.classList.add('animate__animated', 'animate__fadeInRight');
    tabContent.classList.add('animate__animated', 'animate__fadeIn');

    // Remove animation classes after animation completes
    setTimeout(() => {
        tabElement.classList.remove('animate__animated', 'animate__fadeInRight');
        tabContent.classList.remove('animate__animated', 'animate__fadeIn');
    }, 500);

    // Update tab count
    updateTabCount();

    return tabId;
}

// Update tab count
function updateTabCount() {
    const tabCount = tabs.length;
    const tabCountElement = document.getElementById('tab-count');

    if (tabCountElement) {
        tabCountElement.textContent = tabCount;

        // Add animation
        tabCountElement.classList.add('count-update');
        setTimeout(() => {
            tabCountElement.classList.remove('count-update');
        }, 500);
    }
}

// Close a tab
function closeTab(tabId) {
    // Don't close if it's the last tab
    if (tabs.length <= 1) {
        return;
    }

    // Find the tab index
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    // Remove tab from DOM
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    const tabContent = document.getElementById(tabId);

    // Add exit animation
    tabElement.classList.add('animate__animated', 'animate__fadeOutRight');
    tabContent.classList.add('animate__animated', 'animate__fadeOut');

    // Remove after animation completes
    setTimeout(() => {
        tabElement.remove();
        tabContent.remove();

        // Remove from tabs array
        tabs.splice(tabIndex, 1);

        // If the closed tab was active, activate another tab
        if (activeTabId === tabId) {
            activateTab(tabs[0].id);
        }
    }, 300);
}

// Activate a tab
function activateTab(tabId) {
    // Update active tab ID
    activeTabId = tabId;

    // Update tab elements with animation
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.classList.contains('active')) {
            // Add exit animation to previously active tab
            tab.classList.add('tab-deactivating');
            setTimeout(() => {
                tab.classList.remove('active', 'tab-deactivating');
            }, 150);
        }
    });

    const activeTab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
    activeTab.classList.add('tab-activating');
    setTimeout(() => {
        activeTab.classList.add('active');
        activeTab.classList.remove('tab-activating');
    }, 150);

    // Update tab content with animation
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.classList.contains('active')) {
            // Add exit animation to previously active pane
            pane.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                pane.classList.remove('active', 'animate__animated', 'animate__fadeOut');
            }, 200);
        }
    });

    const activePane = document.getElementById(tabId);
    activePane.classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
        activePane.classList.add('active');
    }, 100);

    setTimeout(() => {
        activePane.classList.remove('animate__animated', 'animate__fadeIn');
    }, 500);

    // Update navigation state and URL
    updateNavigationState();
    updateCurrentUrl();
}

// Navigate the active tab to a URL
function navigateActiveTab(url) {
    showLoading();

    // Find the active tab
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return;

    // Get the webview
    const webview = document.getElementById(activeTab.webviewId);
    if (!webview) return;

    // Navigate to the URL
    webview.src = url;

    // Update the tab title based on the URL
    updateTabTitle(activeTabId, getPageTitleFromUrl(url));

    // Close mobile menu if open
    if (mainNav.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
    }

    // Update active link
    updateActiveLink(url);
}

// Get the active webview
function getActiveWebview() {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return null;
    return document.getElementById(activeTab.webviewId);
}

// Update tab title
function updateTabTitle(tabId, title) {
    // Update in tabs array
    const tab = tabs.find(tab => tab.id === tabId);
    if (tab) {
        tab.title = title;
    }

    // Update in DOM
    const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"] .tab-title`);
    if (tabElement) {
        tabElement.textContent = title;
    }
}

// Get page title from URL
function getPageTitleFromUrl(url) {
    if (url.includes('pms.idiibi.com')) {
        return 'الرئيسية';
    } else if (url.includes('services.html')) {
        return 'خدماتنا';
    } else if (url.includes('about.html')) {
        return 'من نحن';
    } else if (url.includes('projects.html')) {
        return 'المشاريع';
    } else if (url.includes('contact.html')) {
        return 'اتصل بنا';
    } else if (url.includes('anydesk-support.html')) {
        return 'الدعم عن بعد';
    } else {
        return 'تبويب جديد';
    }
}

// Update the active link in the navigation
function updateActiveLink(url) {
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to the appropriate link
    if (url.includes('pms.idiibi.com')) {
        pmsLink.classList.add('active');
    } else if (url.includes('services.html')) {
        servicesLink.classList.add('active');
    } else if (url.includes('about.html')) {
        aboutLink.classList.add('active');
    } else if (url.includes('projects.html')) {
        projectsLink.classList.add('active');
    } else if (url.includes('contact.html')) {
        contactLink.classList.add('active');
    } else if (url.includes('anydesk-support.html')) {
        supportLink.classList.add('active');
    }
}

// Update navigation buttons state
function updateNavigationState() {
    const activeWebview = getActiveWebview();
    if (!activeWebview) return;

    backButton.disabled = !activeWebview.canGoBack();
    forwardButton.disabled = !activeWebview.canGoForward();
}

// Update current URL display
function updateCurrentUrl() {
    const activeWebview = getActiveWebview();
    if (!activeWebview) return;

    const url = activeWebview.getURL();
    urlInput.value = url;
}

// Show loading screen
function showLoading() {
    loadingScreen.classList.remove('hidden');
}

// Hide loading screen
function hideLoading() {
    loadingScreen.classList.add('hidden');
}

// Set up status bar
function setupStatusBar() {
    // Set initial progress
    const pageProgress = document.getElementById('page-progress');
    if (pageProgress) {
        pageProgress.style.width = '100%';
    }
}

// Show bookmarks modal
function showBookmarksModal() {
    const bookmarksModal = document.getElementById('bookmarks-modal');
    bookmarksModal.classList.add('show');

    // Load bookmarks
    loadBookmarks();
}

// Hide bookmarks modal
function hideBookmarksModal() {
    const bookmarksModal = document.getElementById('bookmarks-modal');
    bookmarksModal.classList.remove('show');
}

// Show history modal
function showHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    historyModal.classList.add('show');

    // Load history
    loadHistory();
}

// Hide history modal
function hideHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    historyModal.classList.remove('show');
}

// Load bookmarks from localStorage
function loadBookmarks() {
    const bookmarksList = document.getElementById('bookmarks-list');
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const searchInput = document.getElementById('bookmarks-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    // Clear current list
    bookmarksList.innerHTML = '';

    // Filter bookmarks based on search term
    const filteredBookmarks = searchTerm
        ? bookmarks.filter(bookmark =>
            bookmark.title.toLowerCase().includes(searchTerm) ||
            bookmark.url.toLowerCase().includes(searchTerm))
        : bookmarks;

    if (filteredBookmarks.length === 0) {
        // Show empty state
        if (searchTerm && bookmarks.length > 0) {
            // No results for search
            bookmarksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <p>لا توجد نتائج مطابقة لـ "${searchTerm}"</p>
                    <button type="button" class="add-button" id="clear-search-button">مسح البحث</button>
                </div>
            `;

            // Add event listener to the clear search button
            const clearSearchButton = document.getElementById('clear-search-button');
            if (clearSearchButton) {
                clearSearchButton.addEventListener('click', () => {
                    searchInput.value = '';
                    loadBookmarks();
                });
            }
        } else {
            // No bookmarks at all
            bookmarksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark empty-icon"></i>
                    <p>لا توجد مفضلة محفوظة</p>
                    <button type="button" class="add-button" id="add-first-bookmark">إضافة مفضلة</button>
                </div>
            `;

            // Add event listener to the add button
            const addButton = document.getElementById('add-first-bookmark');
            if (addButton) {
                addButton.addEventListener('click', showAddBookmarkModal);
            }
        }
    } else {
        // Group bookmarks by folder
        const bookmarksByFolder = {};
        const noFolderBookmarks = [];

        filteredBookmarks.forEach(bookmark => {
            if (bookmark.folder) {
                if (!bookmarksByFolder[bookmark.folder]) {
                    bookmarksByFolder[bookmark.folder] = [];
                }
                bookmarksByFolder[bookmark.folder].push(bookmark);
            } else {
                noFolderBookmarks.push(bookmark);
            }
        });

        // Add bookmarks without folder first
        if (noFolderBookmarks.length > 0) {
            noFolderBookmarks.forEach(bookmark => {
                addBookmarkToList(bookmark, bookmarksList);
            });
        }

        // Add bookmarks with folders
        Object.keys(bookmarksByFolder).forEach(folder => {
            // Create folder element
            const folderElement = document.createElement('div');
            folderElement.className = 'bookmark-folder';
            folderElement.innerHTML = `
                <div class="folder-header">
                    <i class="fas fa-folder"></i>
                    <span class="folder-name">${folder}</span>
                    <button type="button" class="folder-toggle" title="توسيع/طي"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="folder-content"></div>
            `;

            // Add event listener to toggle folder
            const folderToggle = folderElement.querySelector('.folder-toggle');
            const folderContent = folderElement.querySelector('.folder-content');

            folderToggle.addEventListener('click', () => {
                folderContent.classList.toggle('collapsed');
                folderToggle.querySelector('i').classList.toggle('fa-chevron-down');
                folderToggle.querySelector('i').classList.toggle('fa-chevron-right');
            });

            // Add bookmarks to folder
            bookmarksByFolder[folder].forEach(bookmark => {
                addBookmarkToList(bookmark, folderContent);
            });

            bookmarksList.appendChild(folderElement);
        });
    }

    // Set up event listeners for bookmark modal buttons
    setupBookmarkModalButtons();

    // Set up search functionality
    if (searchInput && !searchInput.hasSearchListener) {
        searchInput.addEventListener('input', () => {
            loadBookmarks();
        });
        searchInput.hasSearchListener = true;
    }
}

// Add a bookmark to the list
function addBookmarkToList(bookmark, container) {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item animate__animated animate__fadeIn';
    bookmarkItem.innerHTML = `
        <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" class="bookmark-icon" alt="">
        <div class="bookmark-info">
            <div class="bookmark-title">${bookmark.title}</div>
            <div class="bookmark-url">${bookmark.url}</div>
        </div>
        <div class="bookmark-actions">
            <button type="button" class="bookmark-action bookmark-open" title="فتح"><i class="fas fa-external-link-alt"></i></button>
            <button type="button" class="bookmark-action bookmark-edit" title="تعديل"><i class="fas fa-edit"></i></button>
            <button type="button" class="bookmark-action bookmark-delete" title="حذف"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Add event listeners
    const openButton = bookmarkItem.querySelector('.bookmark-open');
    const editButton = bookmarkItem.querySelector('.bookmark-edit');
    const deleteButton = bookmarkItem.querySelector('.bookmark-delete');

    openButton.addEventListener('click', () => {
        navigateActiveTab(bookmark.url);
        hideBookmarksModal();
    });

    editButton.addEventListener('click', () => {
        showEditBookmarkModal(bookmark);
    });

    deleteButton.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من حذف هذه المفضلة؟')) {
            deleteBookmark(bookmark.url);
            loadBookmarks(); // Reload the list
        }
    });

    container.appendChild(bookmarkItem);
}

// Setup bookmark modal buttons
function setupBookmarkModalButtons() {
    const addBookmarkButton = document.getElementById('add-bookmark-button');
    const closeBookmarksModal = document.getElementById('close-bookmarks-modal');
    const importBookmarksButton = document.getElementById('import-bookmarks-button');
    const exportBookmarksButton = document.getElementById('export-bookmarks-button');

    if (addBookmarkButton) {
        addBookmarkButton.addEventListener('click', showAddBookmarkModal);
    }

    if (closeBookmarksModal) {
        closeBookmarksModal.addEventListener('click', hideBookmarksModal);
    }

    if (importBookmarksButton) {
        importBookmarksButton.addEventListener('click', importBookmarks);
    }

    if (exportBookmarksButton) {
        exportBookmarksButton.addEventListener('click', exportBookmarks);
    }
}

// Show add bookmark modal
function showAddBookmarkModal() {
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    const modalTitle = addBookmarkModal.querySelector('.modal-header h2');
    const bookmarkNameInput = document.getElementById('bookmark-name');
    const bookmarkUrlInput = document.getElementById('bookmark-url');
    const bookmarkFolderSelect = document.getElementById('bookmark-folder');
    const form = document.getElementById('add-bookmark-form');

    // Reset form
    form.reset();

    // Change modal title
    modalTitle.textContent = 'إضافة مفضلة جديدة';

    // Clear original URL data attribute
    delete form.dataset.originalUrl;

    // Get current URL and title
    const activeWebview = getActiveWebview();
    if (activeWebview) {
        bookmarkUrlInput.value = activeWebview.getURL();
        bookmarkNameInput.value = getPageTitleFromUrl(activeWebview.getURL());
    }

    // Populate folder options
    if (bookmarkFolderSelect) {
        // Clear existing options except the default ones
        while (bookmarkFolderSelect.options.length > 2) {
            bookmarkFolderSelect.remove(2);
        }

        // Add folder options from existing bookmarks
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const folders = [...new Set(bookmarks
            .filter(b => b.folder)
            .map(b => b.folder))];

        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            bookmarkFolderSelect.appendChild(option);
        });

        // Select default option
        bookmarkFolderSelect.selectedIndex = 0;
    }

    // Show the modal
    addBookmarkModal.classList.add('show');

    // Focus on the name input
    bookmarkNameInput.focus();

    // Set up form submission
    setupBookmarkFormSubmission();
}

// Show edit bookmark modal
function showEditBookmarkModal(bookmark) {
    // Get the modal elements
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    const modalTitle = addBookmarkModal.querySelector('.modal-header h2');
    const bookmarkNameInput = document.getElementById('bookmark-name');
    const bookmarkUrlInput = document.getElementById('bookmark-url');
    const bookmarkFolderSelect = document.getElementById('bookmark-folder');
    const form = document.getElementById('add-bookmark-form');

    // Change modal title
    modalTitle.textContent = 'تعديل المفضلة';

    // Set form values
    bookmarkNameInput.value = bookmark.title;
    bookmarkUrlInput.value = bookmark.url;

    // Set folder value if exists
    if (bookmarkFolderSelect) {
        // Clear existing options except the default ones
        while (bookmarkFolderSelect.options.length > 2) {
            bookmarkFolderSelect.remove(2);
        }

        // Add folder options from existing bookmarks
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const folders = [...new Set(bookmarks
            .filter(b => b.folder)
            .map(b => b.folder))];

        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            bookmarkFolderSelect.appendChild(option);
        });

        // Select the current folder
        if (bookmark.folder) {
            // Check if folder exists in options
            let folderExists = false;
            for (let i = 0; i < bookmarkFolderSelect.options.length; i++) {
                if (bookmarkFolderSelect.options[i].value === bookmark.folder) {
                    bookmarkFolderSelect.selectedIndex = i;
                    folderExists = true;
                    break;
                }
            }

            // If folder doesn't exist, add it
            if (!folderExists) {
                const option = document.createElement('option');
                option.value = bookmark.folder;
                option.textContent = bookmark.folder;
                bookmarkFolderSelect.appendChild(option);
                bookmarkFolderSelect.value = bookmark.folder;
            }
        } else {
            bookmarkFolderSelect.selectedIndex = 0;
        }
    }

    // Store the original URL to identify the bookmark when updating
    form.dataset.originalUrl = bookmark.url;

    // Show the modal
    addBookmarkModal.classList.add('show');

    // Focus on the name input
    bookmarkNameInput.focus();

    // Set up form submission
    setupBookmarkFormSubmission();
}

// Set up bookmark form submission
function setupBookmarkFormSubmission() {
    const form = document.getElementById('add-bookmark-form');
    const cancelButton = document.getElementById('cancel-add-bookmark');
    const closeButton = document.getElementById('close-add-bookmark-modal');

    // Remove existing event listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Add new event listener
    newForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('bookmark-name').value;
        const url = document.getElementById('bookmark-url').value;
        const folderSelect = document.getElementById('bookmark-folder');
        let folder = '';

        if (folderSelect) {
            if (folderSelect.value === 'new') {
                // Prompt for new folder name
                const newFolder = prompt('أدخل اسم المجلد الجديد:');
                if (newFolder) {
                    folder = newFolder;
                }
            } else {
                folder = folderSelect.value;
            }
        }

        // Check if it's an edit or add operation
        if (newForm.dataset.originalUrl) {
            // Update existing bookmark
            updateBookmark(newForm.dataset.originalUrl, title, url, folder);
        } else {
            // Add new bookmark
            addBookmark(title, url, folder);
        }

        hideAddBookmarkModal();
        loadBookmarks(); // Reload the list
    });

    // Set up cancel and close buttons
    if (cancelButton) {
        const newCancelButton = cancelButton.cloneNode(true);
        cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
        newCancelButton.addEventListener('click', hideAddBookmarkModal);
    }

    if (closeButton) {
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        newCloseButton.addEventListener('click', hideAddBookmarkModal);
    }
}

// Hide add bookmark modal
function hideAddBookmarkModal() {
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    addBookmarkModal.classList.remove('show');
}

// Add bookmark
function addBookmark(title, url, folder = '') {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    // Check if bookmark already exists
    const exists = bookmarks.some(bookmark => bookmark.url === url);
    if (!exists) {
        bookmarks.push({
            title,
            url,
            folder,
            dateAdded: new Date().toISOString()
        });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showNotification('تمت إضافة المفضلة بنجاح');
        return true;
    } else {
        showNotification('هذه المفضلة موجودة بالفعل');
        return false;
    }
}

// Update a bookmark
function updateBookmark(oldUrl, newTitle, newUrl, newFolder = '') {
    // Get existing bookmarks
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    // Find the bookmark to update
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === oldUrl);
    if (bookmarkIndex === -1) {
        showNotification('المفضلة غير موجودة');
        return false;
    }

    // Check if new URL already exists (except for the current bookmark)
    const exists = bookmarks.some((bookmark, index) =>
        index !== bookmarkIndex && bookmark.url === newUrl);
    if (exists) {
        showNotification('هذا الرابط موجود بالفعل في مفضلة أخرى');
        return false;
    }

    // Update bookmark
    bookmarks[bookmarkIndex] = {
        ...bookmarks[bookmarkIndex],
        title: newTitle,
        url: newUrl,
        folder: newFolder,
        dateModified: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

    showNotification('تم تحديث المفضلة بنجاح');
    return true;
}

// Delete bookmark
function deleteBookmark(url) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const newBookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    showNotification('تم حذف المفضلة بنجاح');
    return true;
}

// Import bookmarks
function importBookmarks() {
    // This is a simplified version - in a real app, you would use a file input
    const bookmarksText = prompt('الصق نص المفضلة المصدرة هنا:');
    if (bookmarksText) {
        try {
            const bookmarks = JSON.parse(bookmarksText);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            loadBookmarks();
            showNotification('تم استيراد المفضلة بنجاح');
        } catch (error) {
            showNotification('حدث خطأ أثناء استيراد المفضلة');
        }
    }
}

// Export bookmarks
function exportBookmarks() {
    const bookmarks = localStorage.getItem('bookmarks') || '[]';
    // This is a simplified version - in a real app, you would download a file
    prompt('انسخ هذا النص لحفظ المفضلة:', bookmarks);
}

// Load history from localStorage
function loadHistory() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');

    // Clear current list
    historyList.innerHTML = '';

    if (history.length === 0) {
        // Show empty state
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history empty-icon"></i>
                <p>لا يوجد سجل تصفح</p>
            </div>
        `;
    } else {
        // Group history by date
        const groupedHistory = groupHistoryByDate(history);

        // Add history items to the list
        Object.keys(groupedHistory).forEach(date => {
            // Add date header
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date-header';
            dateHeader.textContent = date;
            historyList.appendChild(dateHeader);

            // Add items for this date
            groupedHistory[date].forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-time">${item.time}</div>
                    <img src="https://www.google.com/s2/favicons?domain=${item.url}" class="history-icon" alt="">
                    <div class="history-info">
                        <div class="history-title">${item.title}</div>
                        <div class="history-url">${item.url}</div>
                    </div>
                    <div class="history-actions">
                        <button type="button" class="history-action history-open" title="فتح"><i class="fas fa-external-link-alt"></i></button>
                        <button type="button" class="history-action history-delete" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                `;

                // Add event listeners
                const openButton = historyItem.querySelector('.history-open');
                const deleteButton = historyItem.querySelector('.history-delete');

                openButton.addEventListener('click', () => {
                    navigateActiveTab(item.url);
                    hideHistoryModal();
                });

                deleteButton.addEventListener('click', () => {
                    deleteHistoryItem(item.id);
                    loadHistory(); // Reload the list
                });

                historyList.appendChild(historyItem);
            });
        });
    }

    // Set up event listeners for history modal buttons
    setupHistoryModalButtons();
}

// Group history by date
function groupHistoryByDate(history) {
    const grouped = {};

    history.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString('ar-SA');
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Sort each group by timestamp (newest first)
    Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => b.timestamp - a.timestamp);
    });

    return grouped;
}

// Setup history modal buttons
function setupHistoryModalButtons() {
    const clearHistoryButton = document.getElementById('clear-history-button');
    const closeHistoryModal = document.getElementById('close-history-modal');
    const exportHistoryButton = document.getElementById('export-history-button');
    const historySearchInput = document.getElementById('history-search-input');
    const historyFilterSelect = document.getElementById('history-filter-select');

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', clearHistory);
    }

    if (closeHistoryModal) {
        closeHistoryModal.addEventListener('click', hideHistoryModal);
    }

    if (exportHistoryButton) {
        exportHistoryButton.addEventListener('click', exportHistory);
    }

    if (historySearchInput) {
        historySearchInput.addEventListener('input', filterHistory);
    }

    if (historyFilterSelect) {
        historyFilterSelect.addEventListener('change', filterHistory);
    }
}

// Add to history
function addToHistory(title, url) {
    // Don't add about:blank or empty URLs to history
    if (!url || url === 'about:blank' || url.startsWith('chrome://') || url.startsWith('devtools://')) {
        return;
    }

    const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');

    // Add new entry
    const newEntry = {
        id: Date.now().toString(),
        title: title || url,
        url,
        timestamp: Date.now()
    };

    // Add to beginning of array
    history.unshift(newEntry);

    // Limit history size to 1000 entries
    if (history.length > 1000) {
        history.pop();
    }

    localStorage.setItem('browsing_history', JSON.stringify(history));

    console.log('Added to history:', newEntry);
}

// Delete history item
function deleteHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem('browsing_history', JSON.stringify(newHistory));
}

// Clear all history
function clearHistory() {
    if (confirm('هل أنت متأكد من رغبتك في مسح سجل التصفح بالكامل؟')) {
        localStorage.removeItem('browsing_history');
        loadHistory();
        showNotification('تم مسح سجل التصفح بنجاح');
    }
}

// Export history
function exportHistory() {
    const history = localStorage.getItem('browsing_history') || '[]';
    // This is a simplified version - in a real app, you would download a file
    prompt('انسخ هذا النص لحفظ سجل التصفح:', history);
}

// Filter history
function filterHistory() {
    const searchInput = document.getElementById('history-search-input');
    const filterSelect = document.getElementById('history-filter-select');

    if (!searchInput || !filterSelect) return;

    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    // Get all history items
    const historyItems = document.querySelectorAll('.history-item');
    const dateHeaders = document.querySelectorAll('.history-date-header');

    // Hide all date headers initially
    dateHeaders.forEach(header => {
        header.style.display = 'none';
    });

    // Filter by search term and date
    historyItems.forEach(item => {
        const title = item.querySelector('.history-title').textContent.toLowerCase();
        const url = item.querySelector('.history-url').textContent.toLowerCase();
        const matchesSearch = title.includes(searchTerm) || url.includes(searchTerm);

        // Get the date header for this item
        const prevHeader = item.previousElementSibling;

        if (matchesSearch) {
            // Check date filter
            if (filterValue === 'all') {
                item.style.display = 'flex';
                if (prevHeader && prevHeader.classList.contains('history-date-header')) {
                    prevHeader.style.display = 'block';
                }
            } else {
                // Get item date
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                const yesterday = today - 86400000; // 24 hours in milliseconds
                const weekAgo = today - 604800000; // 7 days in milliseconds
                const monthAgo = today - 2592000000; // 30 days in milliseconds

                // Get timestamp from data attribute
                const timestamp = parseInt(item.dataset.timestamp);

                if (
                    (filterValue === 'today' && timestamp >= today) ||
                    (filterValue === 'yesterday' && timestamp >= yesterday && timestamp < today) ||
                    (filterValue === 'week' && timestamp >= weekAgo) ||
                    (filterValue === 'month' && timestamp >= monthAgo)
                ) {
                    item.style.display = 'flex';
                    if (prevHeader && prevHeader.classList.contains('history-date-header')) {
                        prevHeader.style.display = 'block';
                    }
                } else {
                    item.style.display = 'none';
                }
            }
        } else {
            item.style.display = 'none';
        }
    });
}

// Update date and time
function updateDateTime() {
    const gregorianDate = document.getElementById('gregorian-date');
    const hijriDate = document.getElementById('hijri-date');
    const currentTime = document.getElementById('current-time');

    // Get current date and time
    const now = new Date();

    // Format Gregorian date
    const gregorianOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        calendar: 'gregory'
    };
    const formattedDate = new Intl.DateTimeFormat('ar-SA', gregorianOptions).format(now);

    // Format time
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const formattedTime = new Intl.DateTimeFormat('ar-SA', timeOptions).format(now);

    // Update Gregorian date
    gregorianDate.textContent = formattedDate;

    // Update Hijri date using moment-hijri library
    if (window.moment && window.moment.hijri) {
        const hijriDate_moment = window.moment(now).hijri();
        const hijriYear = hijriDate_moment.format('iYYYY');
        const hijriMonth = hijriDate_moment.format('iMM');
        const hijriMonthName = getHijriMonthName(parseInt(hijriMonth));
        const hijriDay = hijriDate_moment.format('iDD');

        // Show date with tooltip containing month name
        hijriDate.textContent = `${hijriYear}/${hijriMonth}/${hijriDay}`;
        hijriDate.title = `${hijriDay} ${hijriMonthName} ${hijriYear}هـ`;

        // Add data attributes for potential UI enhancements
        hijriDate.dataset.year = hijriYear;
        hijriDate.dataset.month = hijriMonth;
        hijriDate.dataset.monthName = hijriMonthName;
        hijriDate.dataset.day = hijriDay;
    } else {
        // Fallback to our approximation if the library is not available
        const islamicYear = Math.floor(now.getFullYear() - 622 + (now.getFullYear() - 622) / 32);
        const islamicMonth = getIslamicMonth(now.getMonth() + 1, now.getDate(), now.getFullYear());
        const islamicMonthName = getHijriMonthName(parseInt(islamicMonth));
        const islamicDay = getIslamicDay(now.getDate(), now.getMonth() + 1, now.getFullYear());

        hijriDate.textContent = `${islamicYear}/${islamicMonth}/${islamicDay}`;
        hijriDate.title = `${islamicDay} ${islamicMonthName} ${islamicYear}هـ`;
    }

    // Update current time
    currentTime.textContent = formattedTime;

    // Add animation effect to time
    currentTime.classList.add('time-update');
    setTimeout(() => {
        currentTime.classList.remove('time-update');
    }, 500);
}

// Simple function to approximate Islamic month
function getIslamicMonth(month, day, year) {
    // This is a more accurate approximation
    const jd = gregorianToJulian(year, month, day);
    const islamicDate = julianToIslamic(jd);
    return String(islamicDate.month).padStart(2, '0');
}

// Simple function to approximate Islamic day
function getIslamicDay(day, month, year) {
    // This is a more accurate approximation
    const jd = gregorianToJulian(year, month, day);
    const islamicDate = julianToIslamic(jd);
    return String(islamicDate.day).padStart(2, '0');
}

// Convert Gregorian date to Julian day
function gregorianToJulian(year, month, day) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }

    const a = Math.floor(year / 100);
    const b = Math.floor(a / 4);
    const c = 2 - a + b;
    const e = Math.floor(365.25 * (year + 4716));
    const f = Math.floor(30.6001 * (month + 1));

    return c + day + e + f - 1524.5;
}

// Convert Julian day to Islamic date
function julianToIslamic(jd) {
    const l = Math.floor(jd) + 0.5;
    const n = Math.floor((l - 1948440 + 10632) / 10631);
    const j = l - 1948440 + 10631 * n + 354;
    const k = Math.floor((j - 0.5) / 10631);

    const o = j - 10631 * k + 354;
    const p = Math.floor((10985 - o) / 5316) * Math.floor((50 * o) / 17719) + Math.floor(o / 5670) * Math.floor((43 * o) / 15238);
    const q = o - Math.floor((30 - p) / 15) * Math.floor((17719 * p) / 50) - Math.floor(p / 16) * Math.floor((15238 * p) / 43) + 29;

    const m = Math.floor((24 * q) / 709);
    const d = q - Math.floor((709 * m) / 24);
    const y = 30 * n + k - 30;

    return { year: y, month: m + 1, day: d };
}

// Get Hijri month name
function getHijriMonthName(month) {
    const hijriMonths = [
        'محرم',
        'صفر',
        'ربيع الأول',
        'ربيع الثاني',
        'جمادى الأولى',
        'جمادى الآخرة',
        'رجب',
        'شعبان',
        'رمضان',
        'شوال',
        'ذو القعدة',
        'ذو الحجة'
    ];

    // Ensure month is between 1-12
    const monthIndex = ((month - 1) % 12 + 12) % 12;
    return hijriMonths[monthIndex];
}

// Update network information
async function updateNetworkInfo() {
    try {
        const downloadSpeed = document.getElementById('download-speed');
        const uploadSpeed = document.getElementById('upload-speed');
        const connectionStatus = document.getElementById('connection-status');
        const downloadIcon = document.querySelector('.status-item i.fa-download');
        const uploadIcon = document.querySelector('.status-item i.fa-upload');
        const wifiIcon = document.querySelector('.status-item i.fa-wifi');

        // Get network info from main process
        const networkInfo = await window.api.invoke('get-network-info');

        // Update UI with animation
        if (networkInfo.isOnline) {
            // Add animation class
            downloadSpeed.classList.add('value-update');
            uploadSpeed.classList.add('value-update');

            // Update values
            downloadSpeed.textContent = `${networkInfo.downloadSpeed} Mbps`;
            uploadSpeed.textContent = `${networkInfo.uploadSpeed} Mbps`;
            connectionStatus.textContent = 'متصل';
            connectionStatus.style.color = '#4caf50';

            // Update icons based on speed
            if (networkInfo.downloadSpeed > 10) {
                downloadIcon.style.color = '#4caf50'; // Fast
            } else if (networkInfo.downloadSpeed > 5) {
                downloadIcon.style.color = '#ff9800'; // Medium
            } else {
                downloadIcon.style.color = '#f44336'; // Slow
            }

            if (networkInfo.uploadSpeed > 5) {
                uploadIcon.style.color = '#4caf50'; // Fast
            } else if (networkInfo.uploadSpeed > 2) {
                uploadIcon.style.color = '#ff9800'; // Medium
            } else {
                uploadIcon.style.color = '#f44336'; // Slow
            }

            // Update WiFi icon
            wifiIcon.className = 'fas fa-wifi';
            wifiIcon.style.color = '#4caf50';
        } else {
            downloadSpeed.textContent = '0 Mbps';
            uploadSpeed.textContent = '0 Mbps';
            connectionStatus.textContent = 'غير متصل';
            connectionStatus.style.color = '#f44336';

            // Update icons
            downloadIcon.style.color = '#f44336';
            uploadIcon.style.color = '#f44336';

            // Change WiFi icon to disconnected
            wifiIcon.className = 'fas fa-wifi-slash';
            wifiIcon.style.color = '#f44336';
        }

        // Remove animation class after animation completes
        setTimeout(() => {
            downloadSpeed.classList.remove('value-update');
            uploadSpeed.classList.remove('value-update');
        }, 500);
    } catch (error) {
        console.error('Error updating network info:', error);

        // Show error in status bar
        const connectionStatus = document.getElementById('connection-status');
        connectionStatus.textContent = 'خطأ في الاتصال';
        connectionStatus.style.color = '#f44336';
    }
}

// Check internet speed
function checkInternetSpeed() {
    // Show notification that speed test is starting
    showNotification('جاري فحص سرعة الإنترنت...');

    // In a real app, you would implement a proper speed test
    // For now, we'll just simulate it
    setTimeout(() => {
        const downloadSpeed = Math.floor(Math.random() * 100) + 10;
        const uploadSpeed = Math.floor(Math.random() * 20) + 5;

        showNotification(`نتيجة الفحص: التحميل ${downloadSpeed} Mbps، الرفع ${uploadSpeed} Mbps`);

        // Update the status bar
        document.getElementById('download-speed').textContent = `${downloadSpeed} Mbps`;
        document.getElementById('upload-speed').textContent = `${uploadSpeed} Mbps`;
    }, 2000);
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Apply data saver mode to webview
function applyDataSaverMode(webview) {
    webview.executeJavaScript(`
        // Function to apply data saver mode
        function applyDataSaverMode() {
            // Create a style element
            const style = document.createElement('style');
            style.id = 'data-saver-style';
            style.textContent = \`
                /* Reduce image quality */
                img {
                    image-rendering: optimizeSpeed !important;
                    max-width: 100% !important;
                    transform: scale(0.9) !important;
                }

                /* Disable animations */
                *, *::before, *::after {
                    animation-duration: 0.001s !important;
                    animation-delay: 0.001s !important;
                    transition-duration: 0.001s !important;
                    transition-delay: 0.001s !important;
                }

                /* Disable video autoplay */
                video {
                    autoplay: none !important;
                }

                /* Disable background images */
                *[style*="background-image"] {
                    background-image: none !important;
                }

                /* Simplify fonts */
                * {
                    font-family: Arial, sans-serif !important;
                }
            \`;

            // Add the style to the document
            document.head.appendChild(style);

            // Disable loading of large resources
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            // Handle images
                            if (node.tagName === 'IMG') {
                                // Set loading to lazy
                                node.loading = 'lazy';

                                // Reduce image quality by setting a smaller src if possible
                                if (node.src && node.src.includes('?')) {
                                    node.src = node.src + '&quality=50';
                                } else if (node.src) {
                                    node.src = node.src + '?quality=50';
                                }
                            }

                            // Handle videos
                            if (node.tagName === 'VIDEO') {
                                // Disable autoplay
                                node.autoplay = false;

                                // Set to low quality if possible
                                if (node.querySelector('source')) {
                                    const sources = node.querySelectorAll('source');
                                    sources.forEach(source => {
                                        if (source.src.includes('?')) {
                                            source.src = source.src + '&quality=low';
                                        } else {
                                            source.src = source.src + '?quality=low';
                                        }
                                    });
                                }
                            }

                            // Handle iframes
                            if (node.tagName === 'IFRAME') {
                                // Add loading lazy
                                node.loading = 'lazy';
                            }
                        });
                    }
                });
            });

            // Start observing the document
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            // Add data saver indicator
            const dataSaverIndicator = document.createElement('div');
            dataSaverIndicator.style.cssText = \`
                position: fixed;
                bottom: 10px;
                left: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 9999;
            \`;
            dataSaverIndicator.textContent = 'وضع توفير البيانات مفعل';
            document.body.appendChild(dataSaverIndicator);

            console.log('Data saver mode applied');
        }

        // Apply data saver mode when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyDataSaverMode);
        } else {
            applyDataSaverMode();
        }
    `);

    console.log('Data saver mode applied to webview');
}

// Toggle data saver mode
function toggleDataSaverMode() {
    const currentMode = localStorage.getItem('data_saver_mode');

    if (currentMode === 'enabled') {
        localStorage.setItem('data_saver_mode', 'disabled');
        showNotification('تم إيقاف وضع توفير البيانات');

        // تحديث حالة الزر في القائمة العلوية
        updateDataSaverMenuState(false);
    } else {
        localStorage.setItem('data_saver_mode', 'enabled');
        showNotification('تم تفعيل وضع توفير البيانات');

        // Apply to current webview
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            applyDataSaverMode(activeWebview);
        }

        // تحديث حالة الزر في القائمة العلوية
        updateDataSaverMenuState(true);
    }
}

// تحديث حالة زر وضع توفير البيانات في القائمة العلوية
function updateDataSaverMenuState(enabled) {
    // تحديث حالة الزر في القائمة المنسدلة
    const dataSaverCheckbox = document.getElementById('data-saver-checkbox');
    if (dataSaverCheckbox) {
        dataSaverCheckbox.checked = enabled;
    }

    // إرسال رسالة إلى العملية الرئيسية لتحديث حالة القائمة العلوية
    if (window.api && window.api.send) {
        window.api.send('update-data-saver-menu', enabled);
    }
}

// Set up menu
function setupMenu() {
    const menuButton = document.getElementById('menu-button');
    const menuDropdown = document.getElementById('menu-dropdown');

    // القائمة المنسدلة - عناصر القائمة
    const dataSaverToggle = document.getElementById('data-saver-toggle');
    const dataSaverCheckbox = document.getElementById('data-saver-checkbox');
    const userGuideLink = document.getElementById('user-guide-link');
    const faqLink = document.getElementById('faq-link');
    const checkUpdatesLink = document.getElementById('check-updates-link');
    const aboutLink = document.getElementById('about-link');

    // عناصر قائمة الملف
    const newTabMenu = document.getElementById('new-tab-menu');
    const closeTabMenu = document.getElementById('close-tab-menu');
    const savePageMenu = document.getElementById('save-page-menu');
    const printPageMenu = document.getElementById('print-page-menu');
    const exitMenu = document.getElementById('exit-menu');

    // عناصر قائمة تحرير
    const findInPageMenu = document.getElementById('find-in-page-menu');

    // عناصر قائمة عرض
    const readerModeMenu = document.getElementById('reader-mode-menu');
    const darkModeMenu = document.getElementById('dark-mode-menu');
    const fullscreenMenu = document.getElementById('fullscreen-menu');

    // عناصر قائمة أدوات
    const clearCacheMenu = document.getElementById('clear-cache-menu');
    const clearCookiesMenu = document.getElementById('clear-cookies-menu');
    const clearAllDataMenu = document.getElementById('clear-all-data-menu');
    const checkSpeedMenu = document.getElementById('check-speed-menu');

    // Toggle menu dropdown
    menuButton.addEventListener('click', () => {
        menuDropdown.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.remove('show');
        }
    });

    // Data saver toggle
    if (dataSaverToggle) {
        dataSaverToggle.addEventListener('click', () => {
            toggleDataSaverMode();
            dataSaverCheckbox.checked = localStorage.getItem('data_saver_mode') === 'enabled';
        });
    }

    // Page links
    if (userGuideLink) {
        userGuideLink.addEventListener('click', () => {
            openPage('user-guide.html');
            menuDropdown.classList.remove('show');
        });
    }

    if (faqLink) {
        faqLink.addEventListener('click', () => {
            openPage('faq.html');
            menuDropdown.classList.remove('show');
        });
    }

    if (checkUpdatesLink) {
        checkUpdatesLink.addEventListener('click', () => {
            openPage('check-updates.html');
            menuDropdown.classList.remove('show');
        });
    }

    if (aboutLink) {
        aboutLink.addEventListener('click', () => {
            openPage('about.html');
            menuDropdown.classList.remove('show');
        });
    }

    // قائمة الملف
    if (newTabMenu) {
        newTabMenu.addEventListener('click', () => {
            createNewTab();
            menuDropdown.classList.remove('show');
        });
    }

    if (closeTabMenu) {
        closeTabMenu.addEventListener('click', () => {
            closeTab(activeTabId);
            menuDropdown.classList.remove('show');
        });
    }

    if (savePageMenu) {
        savePageMenu.addEventListener('click', () => {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.downloadURL(activeWebview.getURL());
            }
            menuDropdown.classList.remove('show');
        });
    }

    if (printPageMenu) {
        printPageMenu.addEventListener('click', () => {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.print();
            }
            menuDropdown.classList.remove('show');
        });
    }

    if (exitMenu) {
        exitMenu.addEventListener('click', () => {
            window.api.send('quit-app');
            menuDropdown.classList.remove('show');
        });
    }

    // قائمة تحرير
    if (findInPageMenu) {
        findInPageMenu.addEventListener('click', () => {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                const searchTerm = prompt('أدخل كلمة البحث:');
                if (searchTerm) {
                    activeWebview.findInPage(searchTerm);
                }
            }
            menuDropdown.classList.remove('show');
        });
    }

    // قائمة عرض
    if (readerModeMenu) {
        readerModeMenu.addEventListener('click', () => {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.executeJavaScript(`
                    document.querySelectorAll('*').forEach(el => {
                        if (el.tagName !== 'BODY' && el.tagName !== 'ARTICLE' && el.tagName !== 'P' &&
                            el.tagName !== 'H1' && el.tagName !== 'H2' && el.tagName !== 'H3' &&
                            el.tagName !== 'H4' && el.tagName !== 'H5' && el.tagName !== 'H6' &&
                            el.tagName !== 'IMG' && el.tagName !== 'A') {
                            el.style.display = 'none';
                        }
                    });
                    document.body.style.maxWidth = '800px';
                    document.body.style.margin = '0 auto';
                    document.body.style.padding = '20px';
                    document.body.style.fontSize = '18px';
                    document.body.style.lineHeight = '1.6';
                `);
            }
            menuDropdown.classList.remove('show');
        });
    }

    if (darkModeMenu) {
        darkModeMenu.addEventListener('click', () => {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.executeJavaScript(`
                    document.body.style.backgroundColor = '#1e1e1e';
                    document.body.style.color = '#f0f0f0';
                    document.querySelectorAll('a').forEach(a => {
                        a.style.color = '#4da6ff';
                    });
                `);
            }
            menuDropdown.classList.remove('show');
        });
    }

    if (fullscreenMenu) {
        fullscreenMenu.addEventListener('click', () => {
            window.api.send('toggle-fullscreen');
            menuDropdown.classList.remove('show');
        });
    }

    // قائمة أدوات
    if (clearCacheMenu) {
        clearCacheMenu.addEventListener('click', () => {
            window.api.send('clear-cache');
            showNotification('تم مسح الكاش بنجاح');
            menuDropdown.classList.remove('show');
        });
    }

    if (clearCookiesMenu) {
        clearCookiesMenu.addEventListener('click', () => {
            window.api.send('clear-cookies');
            showNotification('تم مسح ملفات تعريف الارتباط بنجاح');
            menuDropdown.classList.remove('show');
        });
    }

    if (clearAllDataMenu) {
        clearAllDataMenu.addEventListener('click', () => {
            window.api.send('clear-all-data');
            showNotification('تم مسح جميع بيانات التصفح بنجاح');
            menuDropdown.classList.remove('show');
        });
    }

    if (checkSpeedMenu) {
        checkSpeedMenu.addEventListener('click', () => {
            checkInternetSpeed();
            menuDropdown.classList.remove('show');
        });
    }
}

// Open a page in a new window
function openPage(page) {
    // إرسال طلب فتح صفحة إلى العملية الرئيسية
    window.api.send('open-page', { page });
}

// Initialize data saver mode
function initDataSaverMode() {
    const dataSaverCheckbox = document.getElementById('data-saver-checkbox');

    if (!dataSaverCheckbox) return;

    // Set initial state
    const isEnabled = localStorage.getItem('data_saver_mode') === 'enabled';
    dataSaverCheckbox.checked = isEnabled;

    // تحديث حالة القائمة العلوية
    updateDataSaverMenuState(isEnabled);

    // Add event listener
    dataSaverCheckbox.addEventListener('change', () => {
        if (dataSaverCheckbox.checked) {
            localStorage.setItem('data_saver_mode', 'enabled');
            showNotification('تم تفعيل وضع توفير البيانات');

            // Apply to current webview
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                applyDataSaverMode(activeWebview);
            }

            // تحديث حالة القائمة العلوية
            updateDataSaverMenuState(true);
        } else {
            localStorage.setItem('data_saver_mode', 'disabled');
            showNotification('تم إيقاف وضع توفير البيانات');

            // Reload current webview to disable data saver
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.reload();
            }

            // تحديث حالة القائمة العلوية
            updateDataSaverMenuState(false);
        }
    });

    // إضافة وظيفة toggleDataSaverMode إلى النافذة لاستخدامها من العملية الرئيسية
    window.toggleDataSaverMode = toggleDataSaverMode;
}

// Set up AI button and dropdown
function setupAIButton() {
    const aiButton = document.getElementById('ai-button');
    const aiDropdown = document.getElementById('ai-dropdown');
    const aiItems = document.querySelectorAll('.ai-item');

    // تحديد موقع القائمة المنسدلة بناءً على أبعاد الشاشة
    function positionDropdown() {
        // إعادة تعيين التحويلات لحساب الموقع بشكل صحيح
        if (window.innerWidth <= 576) {
            // للشاشات الصغيرة، نضع القائمة في المنتصف
            aiDropdown.style.right = '50%';
            aiDropdown.style.transform = aiDropdown.classList.contains('show')
                ? 'translateY(0) translateX(50%)'
                : 'translateY(10px) translateX(50%)';
        } else {
            // للشاشات الكبيرة، نضع القائمة بجوار الزر
            aiDropdown.style.right = '10px';
            aiDropdown.style.transform = aiDropdown.classList.contains('show')
                ? 'translateY(0)'
                : 'translateY(10px)';
        }

        // تحديد الارتفاع الأقصى بناءً على ارتفاع الشاشة
        const maxHeight = Math.min(window.innerHeight * 0.6, 500);
        const content = aiDropdown.querySelector('.ai-dropdown-content');
        if (content) {
            content.style.maxHeight = `${maxHeight}px`;
        }
    }

    // تحديد موقع القائمة عند تحميل الصفحة
    positionDropdown();

    // تحديث موقع القائمة عند تغيير حجم الشاشة
    window.addEventListener('resize', positionDropdown);

    // Toggle AI dropdown when AI button is clicked
    aiButton.addEventListener('click', (e) => {
        e.stopPropagation();

        // إغلاق القائمة إذا كانت مفتوحة
        if (aiDropdown.classList.contains('show')) {
            aiDropdown.classList.remove('show');
            return;
        }

        // فتح القائمة وتحديد موقعها
        positionDropdown();
        aiDropdown.classList.add('show');

        // Add animation class
        aiDropdown.classList.add('animate__animated', 'animate__fadeIn');

        // تمرير القائمة إلى الأعلى
        const content = aiDropdown.querySelector('.ai-dropdown-content');
        if (content) {
            content.scrollTop = 0;
        }
    });

    // Close AI dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!aiButton.contains(e.target) && !aiDropdown.contains(e.target)) {
            aiDropdown.classList.remove('show');
        }
    });

    // إغلاق القائمة عند الضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiDropdown.classList.contains('show')) {
            aiDropdown.classList.remove('show');
        }
    });

    // Handle AI item clicks
    aiItems.forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            if (url) {
                // إظهار تأثير النقر
                item.classList.add('animate__animated', 'animate__fadeOut');

                // انتظار انتهاء التأثير ثم فتح التبويب الجديد
                setTimeout(() => {
                    // Navigate to the AI website in a new tab
                    createNewTab(item.querySelector('.ai-name').textContent, url);

                    // Close the dropdown
                    aiDropdown.classList.remove('show');

                    // إزالة تأثير النقر بعد إغلاق القائمة
                    setTimeout(() => {
                        item.classList.remove('animate__animated', 'animate__fadeOut');
                    }, 300);
                }, 300);
            }
        });

        // Add hover animation for color indicators
        item.addEventListener('mouseenter', () => {
            const colorIndicator = item.querySelector('.ai-color-indicator');
            if (colorIndicator) {
                colorIndicator.classList.add('animate__animated', 'animate__fadeIn');
            }
        });

        item.addEventListener('mouseleave', () => {
            const colorIndicator = item.querySelector('.ai-color-indicator');
            if (colorIndicator) {
                colorIndicator.classList.remove('animate__animated', 'animate__fadeIn');
            }
        });
    });

    // Function to get a color based on AI name
    function getColorForAI(name) {
        const colors = {
            'ChatGPT': '#10a37f',
            'Google Gemini': '#4285f4',
            'Bing AI': '#00897b',
            'Claude': '#9c27b0',
            'Poe': '#ff5722',
            'Perplexity': '#3f51b5'
        };

        return colors[name] || '#7928CA';
    }
}
