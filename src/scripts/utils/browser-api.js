import Messenger from 'ext-messenger';

/* messenger */

const messenger = new Messenger();

/* native stuff */

// The name of the extension.
const { name: extensionName } = chrome.runtime.getManifest();

// The ID of the extension.
const id = () => chrome.runtime.id;

// Converts a relative path within an extension install directory to a fully-qualified URL.
const getURL = file => chrome.runtime.getURL(file);

// Sends a single message to event listeners with an optional response.
// https://developer.chrome.com/apps/runtime#method-sendMessage
const sendMessage = (message, options, callback) => {
  chrome.runtime.sendMessage(chrome.runtime.id, message, options, (response) => {
    callback(response);
  });
};

// Sends a single message to the content script(s) in the specified tab with an optional callback.
// https://developer.chrome.com/extensions/tabs#method-sendMessage
const sendTabMessage = (tabId, message, options, callback) => {
  chrome.tabs.sendMessage(tabId, message, options, (response) => {
    callback(response);
  });
};

// Fired when a message is sent from either
// an extension process (runtime.sendMessage) or a content script (tabs.sendMessage).
// https://developer.chrome.com/apps/runtime#event-onMessage
const onMessage = (callback) => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    callback(message, sender, sendResponse);
  });
};

// Creates a new tab.
// https://developer.chrome.com/extensions/tabs#method-create
const newTab = (location, callback) => {
  chrome.tabs.create({ url: location }, (tab) => {
    callback(tab);
  });
};

// Injects JavaScript code into a page.
// https://developer.chrome.com/extensions/tabs#method-executeScript
const exec = (tabId, details, callback) => {
  chrome.tabs.executeScript(tabId, details, (results) => {
    callback(results);
  });
};

// Fired when a tab is updated.
// https://developer.chrome.com/extensions/tabs#event-onUpdated
const onUpdatedTab = (callback) => {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    callback(tabId, changeInfo, tab);
  });
};

// Fires when the active tab in a window changes.
// Note that the tab's URL may not be set at the time this event fired,
// but you can listen to onUpdated events so as to be notified when a URL is set.
// https://developer.chrome.com/extensions/tabs#event-onActivated
const onActivatedTab = (callback) => {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    callback(activeInfo);
  });
};

// Gets the tab that this script call is being made from.
// May be undefined if called from a non-tab context (for example, a background page or popup view).
// https://developer.chrome.com/extensions/tabs#method-getCurrent
const getCurrent = (callback) => {
  chrome.tabs.getCurrent((tab) => {
    callback(tab);
  });
};

// Get all tabs.
const getAllTabs = (callback) => {
  // Gets all windows.
  // https://developer.chrome.com/extensions/windows#method-getAll
  chrome.windows.getAll({ populate: true }, (windows) => {
    let tabs = [];
    Object.keys(windows).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(windows[key], 'tabs')) {
        tabs = tabs.concat(windows[key].tabs);
      }
    });
    callback(tabs);
  });
};

// Get active tab.
const getActiveTab = (callback) => {
  // Gets all tabs that have the specified properties.
  // https://developer.chrome.com/extensions/tabs#method-query
  chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
    callback(tab[0]);
  });
};

// Fired when a browser action icon is clicked.
// Does not fire if the browser action has a popup.
// https://developer.chrome.com/extensions/browserAction#event-onClicked
const onClicked = (callback) => {
  chrome.browserAction.onClicked.addListener(callback);
};

// Sets the icon for the browser action.
// https://developer.chrome.com/extensions/browserAction#method-setIcon
const setIcon = (details, callback) => {
  chrome.browserAction.setIcon(details, () => {
    callback();
  });
};

// Gets the HTML document that is set as the popup for this browser action.
// https://developer.chrome.com/extensions/browserAction#method-getPopup
const getPopup = (details, callback) => {
  chrome.browserAction.getPopup(details, (result) => {
    callback(result);
  });
};

// Browser storage.
const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);

//
const getStorage = key => new Promise(resolve => storage.get(key, resp => resolve(resp)));

// Fired when one or more storage items change.
const updatedStorage = (callback) => {
  storage.onChanged.addListener((object) => {
    callback(object);
  });
};

export {
  messenger,
  extensionName,
  id,
  getURL,
  sendMessage,
  sendTabMessage,
  onMessage,
  newTab,
  exec,
  onUpdatedTab,
  onActivatedTab,
  getCurrent,
  getAllTabs,
  getActiveTab,
  onClicked,
  setIcon,
  getPopup,
  storage,
  getStorage,
  updatedStorage,
};
