// Renderer-side runtime for iBrowser plugins/modules.
// Loaded before user plugin code so plugins can call:
//
//   IBrowserPlugins.register('my-plugin-id', (api) => { ... });
//
// See PLUGINS.md for the full API reference and manifest schema.
(function () {
  const registry = {};

  function toolbarContainer() {
    return document.getElementById('plugin-toolbar');
  }

  function makeApiFor(id) {
    return {
      // Adds a button to the plugin toolbar area next to the AI/menu buttons.
      addToolbarButton({ icon = 'fa-puzzle-piece', title = '', onClick } = {}) {
        const container = toolbarContainer();
        if (!container) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'plugin-toolbar-button';
        button.title = title;
        button.dataset.pluginId = id;
        button.innerHTML = `<i class="fas ${icon}"></i>`;
        button.addEventListener('click', () => {
          try {
            if (typeof onClick === 'function') onClick();
          } catch (err) {
            console.error(`[plugin:${id}] toolbar button handler failed`, err);
          }
        });

        container.appendChild(button);
        return button;
      },

      // Namespaced persistent storage, backed by the app's settings store.
      storage: {
        async get(key, fallback) {
          return window.ibrowser.plugins.storageGet(id, key, fallback);
        },
        async set(key, value) {
          return window.ibrowser.plugins.storageSet(id, key, value);
        }
      },

      notify(message) {
        if (typeof window.showNotification === 'function') {
          window.showNotification(message);
        }
      },

      getActiveTabUrl() {
        const webview = typeof window.getActiveWebview === 'function' ? window.getActiveWebview() : null;
        return webview ? webview.getURL() : '';
      },

      // Fires whenever the active tab finishes navigating.
      onNavigate(callback) {
        if (typeof callback !== 'function') return;
        document.addEventListener('ibrowser:navigate', (event) => callback(event.detail.url));
      }
    };
  }

  window.IBrowserPlugins = {
    register(id, initFn) {
      if (!id || typeof initFn !== 'function') return;
      if (registry[id]) {
        console.warn(`Plugin "${id}" already registered, skipping duplicate registration.`);
        return;
      }
      const api = makeApiFor(id);
      registry[id] = api;
      try {
        initFn(api);
      } catch (err) {
        console.error(`[plugin:${id}] failed to initialize`, err);
      }
    }
  };

  // Loads every enabled plugin reported by the main process.
  window.IBrowserPlugins.loadEnabled = async function loadEnabled() {
    if (!window.ibrowser || !window.ibrowser.plugins) return;

    let plugins = [];
    try {
      plugins = await window.ibrowser.plugins.list();
    } catch (err) {
      console.error('Failed to list plugins:', err);
      return;
    }

    for (const plugin of plugins) {
      if (!plugin.enabled) continue;
      try {
        const source = await window.ibrowser.plugins.getSource(plugin.id);
        if (!source) continue;
        // eslint-disable-next-line no-new-func
        const run = new Function(source);
        run();
      } catch (err) {
        console.error(`Failed to load plugin "${plugin.id}"`, err);
      }
    }
  };
})();
