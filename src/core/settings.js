// Persistent settings store for iBrowser.
// Stored as plain JSON under the Electron userData directory so it survives
// updates and is easy for advanced users/plugins to inspect.

const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULTS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  homepage: 'https://www.google.com/',
  searchEngine: 'google',
  dataSaverMode: false,
  privacy: {
    doNotTrack: true
  },
  ai: {
    defaultProvider: 'chatgpt',
    enabledProviders: ['chatgpt', 'claude', 'gemini', 'copilot', 'perplexity', 'deepseek', 'grok', 'poe']
  },
  plugins: {
    enabled: {}
  },
  pluginStorage: {}
};

const SEARCH_ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=%s' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
  yandex: { name: 'Yandex', url: 'https://yandex.com/search/?text=%s' }
};

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(source)) return target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function getPath(obj, keyPath, fallback) {
  const parts = String(keyPath).split('.');
  let current = obj;
  for (const part of parts) {
    if (!isPlainObject(current) || !(part in current)) return fallback;
    current = current[part];
  }
  return current === undefined ? fallback : current;
}

function setPath(obj, keyPath, value) {
  const parts = String(keyPath).split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!isPlainObject(current[part])) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

class SettingsStore {
  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'settings.json');
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        return deepMerge(DEFAULTS, raw);
      }
    } catch (err) {
      console.error('Failed to load settings, falling back to defaults:', err);
    }
    return deepMerge({}, DEFAULTS);
  }

  _save() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }

  getAll() {
    return deepMerge({}, this.data);
  }

  get(keyPath, fallback) {
    return getPath(this.data, keyPath, fallback);
  }

  set(keyPath, value) {
    setPath(this.data, keyPath, value);
    this._save();
    return this.getAll();
  }

  reset() {
    this.data = deepMerge({}, DEFAULTS);
    this._save();
    return this.getAll();
  }
}

module.exports = { SettingsStore, SEARCH_ENGINES, DEFAULTS };
