// Integrated settings overlay: General / Appearance / Privacy / AI / Extensions / About.
// Talks to the main process exclusively through the window.ibrowser bridge
// exposed by preload.js (no direct Node/Electron access here).

function resolveTheme(themeSetting) {
    if (themeSetting === 'system') {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        return prefersLight ? 'light' : 'dark';
    }
    return themeSetting === 'light' ? 'light' : 'dark';
}

function applyTheme(themeSetting) {
    const resolved = resolveTheme(themeSetting);
    document.documentElement.dataset.theme = resolved;
    try {
        localStorage.setItem('ibrowser_theme', resolved);
    } catch (err) {
        // localStorage may be unavailable in some contexts; theme still applies for this session.
    }

    document.querySelectorAll('.theme-option').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.themeValue === themeSetting);
    });
}

function openSettingsOverlay(sectionId) {
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    if (sectionId) showSettingsSection(sectionId);
    loadSettingsIntoUI();
}

function closeSettingsOverlay() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.remove('show');
}

function showSettingsSection(sectionId) {
    document.querySelectorAll('.settings-nav-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    document.querySelectorAll('.settings-section').forEach((section) => {
        section.classList.toggle('active', section.id === `settings-section-${sectionId}`);
    });

    if (sectionId === 'extensions') {
        loadExtensionsList();
    }
}

async function loadSettingsIntoUI() {
    let settings;
    try {
        settings = await window.ibrowser.settings.getAll();
    } catch (err) {
        console.error('Failed to load settings:', err);
        return;
    }

    // General
    const homepageInput = document.getElementById('setting-homepage');
    if (homepageInput) homepageInput.value = settings.homepage || '';

    const searchEngineSelect = document.getElementById('setting-search-engine');
    if (searchEngineSelect && !searchEngineSelect.dataset.loaded) {
        try {
            const engines = await window.ibrowser.settings.searchEngines();
            searchEngineSelect.innerHTML = Object.entries(engines)
                .map(([key, engine]) => `<option value="${key}">${engine.name}</option>`)
                .join('');
            searchEngineSelect.dataset.loaded = 'true';
        } catch (err) {
            console.error('Failed to load search engines:', err);
        }
    }
    if (searchEngineSelect) searchEngineSelect.value = settings.searchEngine || 'google';

    // Appearance
    applyTheme(settings.theme || 'dark');

    // Privacy
    const dntCheckbox = document.getElementById('setting-do-not-track');
    if (dntCheckbox) dntCheckbox.checked = !!(settings.privacy && settings.privacy.doNotTrack);

    const dataSaverCheckbox = document.getElementById('setting-data-saver');
    if (dataSaverCheckbox) dataSaverCheckbox.checked = !!settings.dataSaverMode;

    // AI
    const aiDefaultSelect = document.getElementById('setting-ai-default');
    if (aiDefaultSelect) {
        aiDefaultSelect.innerHTML = AI_PROVIDERS.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
        aiDefaultSelect.value = (settings.ai && settings.ai.defaultProvider) || 'chatgpt';
    }

    const enabledProviders = (settings.ai && settings.ai.enabledProviders) || [];
    const providerList = document.getElementById('ai-provider-settings-list');
    if (providerList) {
        providerList.innerHTML = AI_PROVIDERS.map((provider) => `
            <div class="ai-provider-item">
                <span class="ai-provider-dot" style="background-color:${provider.color}"></span>
                <div class="ai-provider-info">
                    <strong>${provider.name}</strong>
                    <span>${provider.url}</span>
                </div>
                <div class="toggle-switch">
                    <input type="checkbox" id="ai-provider-toggle-${provider.id}" data-provider-id="${provider.id}" ${enabledProviders.includes(provider.id) ? 'checked' : ''}>
                    <label for="ai-provider-toggle-${provider.id}"></label>
                </div>
            </div>
        `).join('');

        providerList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
            checkbox.addEventListener('change', async () => {
                const current = await window.ibrowser.settings.get('ai.enabledProviders', []);
                const providerId = checkbox.dataset.providerId;
                const next = checkbox.checked
                    ? [...new Set([...current, providerId])]
                    : current.filter((id) => id !== providerId);
                await window.ibrowser.settings.set('ai.enabledProviders', next);
                if (typeof refreshAIPanel === 'function') refreshAIPanel();
            });
        });
    }

    // About
    try {
        const version = await window.ibrowser.app.getVersion();
        const versionEl = document.getElementById('settings-version');
        if (versionEl) versionEl.textContent = version;
    } catch (err) {
        // Non-fatal: version display is cosmetic.
    }
}

async function loadExtensionsList() {
    const container = document.getElementById('extensions-list');
    if (!container) return;

    container.innerHTML = '<p class="settings-empty">جاري التحميل...</p>';

    let plugins = [];
    try {
        plugins = await window.ibrowser.plugins.list();
    } catch (err) {
        console.error('Failed to list plugins:', err);
        container.innerHTML = '<p class="settings-empty">تعذر تحميل قائمة الإضافات</p>';
        return;
    }

    if (plugins.length === 0) {
        container.innerHTML = '<p class="settings-empty">لا توجد إضافات مثبتة حاليًا</p>';
        return;
    }

    container.innerHTML = plugins.map((plugin) => `
        <div class="extension-item">
            <i class="fas ${plugin.icon}" style="color: var(--primary-light); width: 20px; text-align: center;"></i>
            <div class="extension-info">
                <strong>${plugin.name} <span class="extension-source">${plugin.source === 'bundled' ? 'مدمجة' : 'مثبتة'}</span></strong>
                <span>${plugin.description || plugin.id} · v${plugin.version}</span>
            </div>
            <div class="toggle-switch">
                <input type="checkbox" id="extension-toggle-${plugin.id}" data-plugin-id="${plugin.id}" ${plugin.enabled ? 'checked' : ''}>
                <label for="extension-toggle-${plugin.id}"></label>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', async () => {
            await window.ibrowser.plugins.setEnabled(checkbox.dataset.pluginId, checkbox.checked);
            window.showNotification && window.showNotification('يلزم إعادة تشغيل iBrowser لتطبيق التغيير على الإضافات');
        });
    });
}

function initSettingsUI() {
    document.querySelectorAll('.settings-nav-item').forEach((item) => {
        item.addEventListener('click', () => showSettingsSection(item.dataset.section));
    });

    const closeButton = document.getElementById('settings-close');
    if (closeButton) closeButton.addEventListener('click', closeSettingsOverlay);

    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSettingsOverlay();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('show')) {
            closeSettingsOverlay();
        }
    });

    // General
    const homepageInput = document.getElementById('setting-homepage');
    if (homepageInput) {
        homepageInput.addEventListener('change', () => {
            window.ibrowser.settings.set('homepage', homepageInput.value.trim());
        });
    }

    const searchEngineSelect = document.getElementById('setting-search-engine');
    if (searchEngineSelect) {
        searchEngineSelect.addEventListener('change', () => {
            window.ibrowser.settings.set('searchEngine', searchEngineSelect.value);
        });
    }

    // Appearance
    document.querySelectorAll('.theme-option').forEach((btn) => {
        btn.addEventListener('click', async () => {
            await window.ibrowser.settings.set('theme', btn.dataset.themeValue);
            applyTheme(btn.dataset.themeValue);
        });
    });

    // Privacy
    const dntCheckbox = document.getElementById('setting-do-not-track');
    if (dntCheckbox) {
        dntCheckbox.addEventListener('change', () => {
            window.ibrowser.settings.set('privacy.doNotTrack', dntCheckbox.checked);
        });
    }

    const dataSaverCheckbox = document.getElementById('setting-data-saver');
    if (dataSaverCheckbox) {
        dataSaverCheckbox.addEventListener('change', () => {
            if (typeof window.setDataSaverMode === 'function') {
                window.setDataSaverMode(dataSaverCheckbox.checked);
            }
        });
    }

    const clearCacheBtn = document.getElementById('settings-clear-cache');
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', () => window.api.send('clear-cache'));

    const clearCookiesBtn = document.getElementById('settings-clear-cookies');
    if (clearCookiesBtn) clearCookiesBtn.addEventListener('click', () => window.api.send('clear-cookies'));

    const clearAllBtn = document.getElementById('settings-clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من رغبتك في مسح جميع بيانات التصفح؟')) {
                window.api.send('clear-all-data');
            }
        });
    }

    // AI
    const aiDefaultSelect = document.getElementById('setting-ai-default');
    if (aiDefaultSelect) {
        aiDefaultSelect.addEventListener('change', async () => {
            await window.ibrowser.settings.set('ai.defaultProvider', aiDefaultSelect.value);
            if (typeof refreshAIPanel === 'function') refreshAIPanel();
        });
    }

    // Extensions
    const openPluginsFolderBtn = document.getElementById('settings-open-plugins-folder');
    if (openPluginsFolderBtn) {
        openPluginsFolderBtn.addEventListener('click', () => window.ibrowser.plugins.openFolder());
    }

    const refreshPluginsBtn = document.getElementById('settings-refresh-plugins');
    if (refreshPluginsBtn) refreshPluginsBtn.addEventListener('click', loadExtensionsList);

    // About
    const openWebsiteBtn = document.getElementById('settings-open-website');
    if (openWebsiteBtn) openWebsiteBtn.addEventListener('click', () => window.ibrowser.app.openExternal('https://idiibi.com'));

    const openGithubBtn = document.getElementById('settings-open-github');
    if (openGithubBtn) openGithubBtn.addEventListener('click', () => window.ibrowser.app.openExternal('https://github.com/idiibigu/iBrowser-'));

    const checkUpdatesBtn = document.getElementById('settings-check-updates');
    if (checkUpdatesBtn) {
        checkUpdatesBtn.addEventListener('click', async () => {
            checkUpdatesBtn.disabled = true;
            const result = await window.ibrowser.updates.check();
            checkUpdatesBtn.disabled = false;
            if (result.status === 'available') {
                window.showNotification && window.showNotification(`يتوفر إصدار جديد: ${result.latest}`);
                window.ibrowser.updates.openRelease(result.url);
            } else if (result.status === 'not-available') {
                window.showNotification && window.showNotification('أنت تستخدم أحدث إصدار من iBrowser');
            } else {
                window.showNotification && window.showNotification('تعذر التحقق من التحديثات');
            }
        });
    }

    // Entry points elsewhere in the app
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) settingsButton.addEventListener('click', () => openSettingsOverlay('general'));

    const openSettingsMenu = document.getElementById('open-settings-menu');
    if (openSettingsMenu) {
        openSettingsMenu.addEventListener('click', () => {
            openSettingsOverlay('general');
            document.getElementById('menu-dropdown').classList.remove('show');
        });
    }

    const openExtensionsMenu = document.getElementById('open-extensions-menu');
    if (openExtensionsMenu) {
        openExtensionsMenu.addEventListener('click', () => {
            openSettingsOverlay('extensions');
            document.getElementById('menu-dropdown').classList.remove('show');
        });
    }

    // Apply the persisted theme (and react live if the OS theme changes while set to "system")
    window.ibrowser.settings.get('theme', 'dark').then(applyTheme);
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', async () => {
            const theme = await window.ibrowser.settings.get('theme', 'dark');
            if (theme === 'system') applyTheme('system');
        });
    }
}
