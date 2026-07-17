// AI side panel: lets you chat with an AI provider while keeping the page
// you're browsing open in the main tab area.

const AI_PROVIDERS = [
    { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com/', color: '#10a37f' },
    { id: 'claude', name: 'Claude', url: 'https://claude.ai/', color: '#c96442' },
    { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/', color: '#4285f4' },
    { id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com/', color: '#00897b' },
    { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/', color: '#3f51b5' },
    { id: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', color: '#4f6df5' },
    { id: 'grok', name: 'Grok', url: 'https://grok.com/', color: '#e5e7eb' },
    { id: 'poe', name: 'Poe', url: 'https://poe.com/', color: '#ff5722' }
];

let aiPanelState = {
    activeProviderId: null,
    loadedProviderIds: new Set()
};

function getAIProviderById(id) {
    return AI_PROVIDERS.find((p) => p.id === id);
}

async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            return true;
        } catch (fallbackErr) {
            console.error('Failed to copy text to clipboard:', fallbackErr);
            return false;
        }
    }
}

function selectAIProvider(providerId) {
    const provider = getAIProviderById(providerId);
    if (!provider) return;

    aiPanelState.activeProviderId = providerId;

    document.querySelectorAll('.ai-panel-tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.providerId === providerId);
    });

    document.querySelectorAll('.ai-provider-view').forEach((view) => {
        view.classList.toggle('active', view.dataset.providerId === providerId);
    });

    if (!aiPanelState.loadedProviderIds.has(providerId)) {
        const view = document.querySelector(`.ai-provider-view[data-provider-id="${providerId}"]`);
        if (view && !view.querySelector('webview')) {
            const webview = document.createElement('webview');
            webview.setAttribute('src', provider.url);
            webview.setAttribute('partition', `persist:ai-${providerId}`);
            webview.setAttribute('allowpopups', '');
            view.appendChild(webview);
        }
        aiPanelState.loadedProviderIds.add(providerId);
    }
}

async function renderAIPanelTabs() {
    const tabsContainer = document.getElementById('ai-panel-tabs');
    const bodyContainer = document.getElementById('ai-panel-body');
    if (!tabsContainer || !bodyContainer) return;

    let enabledIds = AI_PROVIDERS.map((p) => p.id);
    let defaultProvider = 'chatgpt';
    try {
        const settings = await window.ibrowser.settings.getAll();
        if (Array.isArray(settings.ai && settings.ai.enabledProviders) && settings.ai.enabledProviders.length) {
            enabledIds = settings.ai.enabledProviders;
        }
        if (settings.ai && settings.ai.defaultProvider) {
            defaultProvider = settings.ai.defaultProvider;
        }
    } catch (err) {
        console.error('Failed to load AI settings:', err);
    }

    const enabledProviders = AI_PROVIDERS.filter((p) => enabledIds.includes(p.id));

    tabsContainer.innerHTML = '';
    bodyContainer.innerHTML = '';

    if (enabledProviders.length === 0) {
        bodyContainer.innerHTML = `
            <div class="ai-panel-empty">
                <i class="fas fa-robot" style="font-size: 28px;"></i>
                <p>لم يتم تفعيل أي مزود ذكاء اصطناعي. فعّل واحدًا من الإعدادات > الذكاء الاصطناعي.</p>
            </div>
        `;
        return;
    }

    enabledProviders.forEach((provider) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'ai-panel-tab';
        tab.dataset.providerId = provider.id;
        tab.innerHTML = `<span class="ai-panel-tab-dot" style="background-color:${provider.color}"></span>${provider.name}`;
        tab.addEventListener('click', () => selectAIProvider(provider.id));
        tabsContainer.appendChild(tab);

        const view = document.createElement('div');
        view.className = 'ai-provider-view';
        view.dataset.providerId = provider.id;
        bodyContainer.appendChild(view);
    });

    const initial = enabledProviders.find((p) => p.id === defaultProvider) || enabledProviders[0];
    selectAIProvider(initial.id);
}

function isAIPanelOpen() {
    const panel = document.getElementById('ai-panel');
    return !!panel && panel.classList.contains('open');
}

function setAIPanelOpen(open) {
    const panel = document.getElementById('ai-panel');
    const toggleButton = document.getElementById('ai-panel-toggle');
    if (!panel) return;

    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (toggleButton) {
        toggleButton.classList.toggle('active', open);
        toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
}

function initAIPanel() {
    const toggleButton = document.getElementById('ai-panel-toggle');
    const closeButton = document.getElementById('ai-panel-close');
    const copySelectionButton = document.getElementById('ai-panel-copy-selection');

    renderAIPanelTabs();

    if (toggleButton) {
        toggleButton.addEventListener('click', () => setAIPanelOpen(!isAIPanelOpen()));
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => setAIPanelOpen(false));
    }

    if (copySelectionButton) {
        copySelectionButton.addEventListener('click', async () => {
            const activeWebview = typeof window.getActiveWebview === 'function' ? window.getActiveWebview() : null;
            if (!activeWebview) return;

            try {
                const selection = await activeWebview.executeJavaScript('window.getSelection().toString()');
                if (!selection) {
                    window.showNotification && window.showNotification('لا يوجد نص محدد في الصفحة الحالية');
                    return;
                }
                const copied = await copyTextToClipboard(selection);
                window.showNotification && window.showNotification(
                    copied ? 'تم نسخ التحديد، الصقه في محادثة الذكاء الاصطناعي' : 'تعذر نسخ التحديد'
                );
                setAIPanelOpen(true);
            } catch (err) {
                console.error('Failed to read page selection:', err);
            }
        });
    }
}

// Re-reads settings and rebuilds the provider tab strip (called after the
// user changes AI settings without requiring a full app restart).
function refreshAIPanel() {
    aiPanelState = { activeProviderId: null, loadedProviderIds: new Set() };
    renderAIPanelTabs();
}
