// Real update checker backed by the GitHub Releases API.
// Replaces the previous mock updater which faked results with Math.random().
// There is no silent auto-download: the user is pointed to the release page,
// which is the honest thing to do for an open-source project without a
// dedicated, code-signed update feed.

const https = require('https');
const { app, shell } = require('electron');

const REPO = 'idiibigu/iBrowser-';
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'iBrowser-UpdateChecker',
          Accept: 'application/vnd.github+json'
        },
        timeout: 10000
      },
      (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Update check timed out')));
  });
}

function parseVersion(version) {
  return String(version || '')
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
}

function isNewer(candidate, current) {
  const a = parseVersion(candidate);
  const b = parseVersion(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

async function checkForUpdates() {
  const current = app.getVersion();
  try {
    const release = await fetchJSON(API_URL);
    const latestTag = release.tag_name || release.name || '';
    const latest = latestTag.replace(/^v/i, '') || current;
    const available = !!latestTag && isNewer(latestTag, current);

    return {
      status: available ? 'available' : 'not-available',
      current,
      latest,
      url: release.html_url || `https://github.com/${REPO}/releases`,
      notes: release.body || '',
      publishedAt: release.published_at || null
    };
  } catch (err) {
    return {
      status: 'error',
      current,
      error: err.message || String(err)
    };
  }
}

function openReleasePage(url) {
  const fallback = `https://github.com/${REPO}/releases`;
  const target = typeof url === 'string' && /^https?:\/\//i.test(url) ? url : fallback;
  shell.openExternal(target);
}

module.exports = { checkForUpdates, openReleasePage, REPO };
