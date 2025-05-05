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

    // Create tab element
    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tabId;
    tabElement.innerHTML = `
        <span class="tab-title">${title}</span>
        <button type="button" class="tab-close" title="إغلاق التبويب"><i class="fas fa-times"></i></button>
    `;

    // Insert tab before the new tab button
    tabsList.insertBefore(tabElement, newTabButton);

    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-pane';
    tabContent.id = tabId;
    tabContent.innerHTML = `
        <div class="webview-container">
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
        webviewId: webviewId
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

    // Activate the new tab
    activateTab(tabId);

    // Add entrance animation
    tabElement.classList.add('animate__animated', 'animate__fadeInRight');
    tabContent.classList.add('animate__animated', 'animate__fadeIn');

    return tabId;
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

    // Update tab elements
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab-id="${tabId}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

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

    // Clear current list
    bookmarksList.innerHTML = '';

    if (bookmarks.length === 0) {
        // Show empty state
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
    } else {
        // Add bookmarks to the list
        bookmarks.forEach(bookmark => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.innerHTML = `
                <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" class="bookmark-icon" alt="">
                <div class="bookmark-info">
                    <div class="bookmark-title">${bookmark.title}</div>
                    <div class="bookmark-url">${bookmark.url}</div>
                </div>
                <div class="bookmark-actions">
                    <button type="button" class="bookmark-action bookmark-open" title="فتح"><i class="fas fa-external-link-alt"></i></button>
                    <button type="button" class="bookmark-action bookmark-delete" title="حذف"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Add event listeners
            const openButton = bookmarkItem.querySelector('.bookmark-open');
            const deleteButton = bookmarkItem.querySelector('.bookmark-delete');

            openButton.addEventListener('click', () => {
                navigateActiveTab(bookmark.url);
                hideBookmarksModal();
            });

            deleteButton.addEventListener('click', () => {
                deleteBookmark(bookmark.url);
                loadBookmarks(); // Reload the list
            });

            bookmarksList.appendChild(bookmarkItem);
        });
    }

    // Set up event listeners for bookmark modal buttons
    setupBookmarkModalButtons();
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
    addBookmarkModal.classList.add('show');

    // Get current URL and title
    const activeWebview = getActiveWebview();
    if (activeWebview) {
        document.getElementById('bookmark-url').value = activeWebview.getURL();
        document.getElementById('bookmark-name').value = getPageTitleFromUrl(activeWebview.getURL());
    }

    // Set up form submission
    const addBookmarkForm = document.getElementById('add-bookmark-form');
    const cancelAddBookmark = document.getElementById('cancel-add-bookmark');
    const closeAddBookmarkModal = document.getElementById('close-add-bookmark-modal');

    addBookmarkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookmark-name').value;
        const url = document.getElementById('bookmark-url').value;

        addBookmark(title, url);
        hideAddBookmarkModal();
        loadBookmarks(); // Reload the list
    });

    cancelAddBookmark.addEventListener('click', hideAddBookmarkModal);
    closeAddBookmarkModal.addEventListener('click', hideAddBookmarkModal);
}

// Hide add bookmark modal
function hideAddBookmarkModal() {
    const addBookmarkModal = document.getElementById('add-bookmark-modal');
    addBookmarkModal.classList.remove('show');
}

// Add bookmark
function addBookmark(title, url) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    // Check if bookmark already exists
    const exists = bookmarks.some(bookmark => bookmark.url === url);
    if (!exists) {
        bookmarks.push({ title, url });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showNotification('تمت إضافة المفضلة بنجاح');
    } else {
        showNotification('هذه المفضلة موجودة بالفعل');
    }
}

// Delete bookmark
function deleteBookmark(url) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const newBookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    showNotification('تم حذف المفضلة بنجاح');
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
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;

    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Update Gregorian date
    gregorianDate.textContent = formattedDate;

    // Update Hijri date using a simple calculation (approximate)
    // This is a simple approximation - for accurate conversion, a proper library should be used
    const islamicYear = Math.floor(year - 622 + (year - 622) / 32);
    const islamicMonth = getIslamicMonth(month, day, year);
    const islamicDay = getIslamicDay(day, month, year);
    hijriDate.textContent = `${islamicYear}/${islamicMonth}/${islamicDay}`;

    // Update current time
    currentTime.textContent = formattedTime;
}

// Simple function to approximate Islamic month
function getIslamicMonth(month, _day, year) {
    // This is a very simple approximation
    const offset = Math.floor((year - 622) * 11 / 30);
    const approxMonth = ((parseInt(month) + offset) % 12) || 12;
    return String(approxMonth).padStart(2, '0');
}

// Simple function to approximate Islamic day
function getIslamicDay(day, _month, _year) {
    // This is a very simple approximation
    const dayNum = parseInt(day);
    return String(((dayNum + 15) % 30) || 30).padStart(2, '0');
}

// Update network information
async function updateNetworkInfo() {
    try {
        const downloadSpeed = document.getElementById('download-speed');
        const uploadSpeed = document.getElementById('upload-speed');
        const connectionStatus = document.getElementById('connection-status');

        // Get network info from main process
        const networkInfo = await window.api.invoke('get-network-info');

        // Update UI
        if (networkInfo.isOnline) {
            downloadSpeed.textContent = `${networkInfo.downloadSpeed} Mbps`;
            uploadSpeed.textContent = `${networkInfo.uploadSpeed} Mbps`;
            connectionStatus.textContent = 'متصل';
            connectionStatus.style.color = '#4caf50';
        } else {
            downloadSpeed.textContent = '0 Mbps';
            uploadSpeed.textContent = '0 Mbps';
            connectionStatus.textContent = 'غير متصل';
            connectionStatus.style.color = '#f44336';
        }
    } catch (error) {
        console.error('Error updating network info:', error);
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
