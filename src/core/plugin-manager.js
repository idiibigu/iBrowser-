// Lightweight extension/module system for iBrowser.
//
// A plugin is a folder containing a `plugin.json` manifest and a JS entry
// file. Bundled plugins ship inside the app (src/plugins); user-installed
// plugins live under the app's userData/plugins directory so they persist
// across updates and can be added without rebuilding the app.
//
// Plugins run inside the renderer's UI context (not sandboxed like a
// browser extension) through the small API defined in src/plugin-api.js.
// See PLUGINS.md for the manifest schema and API reference.

const { app, shell } = require('electron');
const path = require('path');
const fs = require('fs');

class PluginManager {
  constructor(settingsStore) {
    this.settings = settingsStore;
    this.bundledDir = path.join(__dirname, '..', 'plugins');
    this.userDir = path.join(app.getPath('userData'), 'plugins');
    try {
      fs.mkdirSync(this.userDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create user plugins directory:', err);
    }
  }

  _scanDir(dir, source) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
      console.error(`Failed to read plugins directory ${dir}:`, err);
      return results;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pluginDir = path.join(dir, entry.name);
      const manifestPath = path.join(pluginDir, 'plugin.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        if (!manifest.id || !manifest.main) {
          console.warn(`Skipping plugin at ${pluginDir}: missing "id" or "main" in plugin.json`);
          continue;
        }
        const mainPath = path.join(pluginDir, manifest.main);
        if (!fs.existsSync(mainPath)) {
          console.warn(`Skipping plugin "${manifest.id}": entry file not found (${manifest.main})`);
          continue;
        }
        results.push({
          id: manifest.id,
          name: manifest.name || manifest.id,
          version: manifest.version || '0.0.0',
          description: manifest.description || '',
          author: manifest.author || '',
          icon: manifest.icon || 'fa-puzzle-piece',
          source,
          folder: entry.name,
          mainPath
        });
      } catch (err) {
        console.error(`Failed to read plugin manifest at ${manifestPath}:`, err);
      }
    }
    return results;
  }

  list() {
    const bundled = this._scanDir(this.bundledDir, 'bundled');
    const user = this._scanDir(this.userDir, 'user');
    const enabledMap = this.settings.get('plugins.enabled', {});

    const byId = new Map();
    for (const plugin of [...bundled, ...user]) {
      byId.set(plugin.id, plugin);
    }

    return Array.from(byId.values()).map((plugin) => ({
      ...plugin,
      enabled: enabledMap[plugin.id] !== false
    }));
  }

  setEnabled(id, enabled) {
    const enabledMap = this.settings.get('plugins.enabled', {});
    enabledMap[id] = !!enabled;
    this.settings.set('plugins.enabled', enabledMap);
    return this.list();
  }

  readSource(id) {
    const plugin = this.list().find((p) => p.id === id);
    if (!plugin) return null;
    try {
      return fs.readFileSync(plugin.mainPath, 'utf-8');
    } catch (err) {
      console.error(`Failed to read plugin source for "${id}":`, err);
      return null;
    }
  }

  storageGet(pluginId, key, fallback) {
    return this.settings.get(`pluginStorage.${pluginId}.${key}`, fallback);
  }

  storageSet(pluginId, key, value) {
    this.settings.set(`pluginStorage.${pluginId}.${key}`, value);
    return true;
  }

  openUserPluginsFolder() {
    return shell.openPath(this.userDir);
  }
}

module.exports = PluginManager;
