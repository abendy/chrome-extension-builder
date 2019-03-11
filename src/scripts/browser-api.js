const apis = [
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
];

function Extension() {
  apis.forEach((api) => {
    this[api] = null;

    try {
      if (chrome[api]) {
        this[api] = chrome[api];
      }
    // eslint-disable-next-line no-empty
    } catch (e) {}

    try {
      if (window[api]) {
        this[api] = window[api];
      }
    // eslint-disable-next-line no-empty
    } catch (e) {}
  });
}

module.exports = new Extension();
