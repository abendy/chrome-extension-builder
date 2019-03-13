import Messenger from 'ext-messenger';

/* messenger */

const messenger = new Messenger();

/* native stuff */

const getURL = file => chrome.extension.getURL(file);

const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);

const button = (callback) => {
  chrome.browserAction.onClicked.addListener(callback);
};

const listen = (callback) => {
  chrome.runtime.onMessage.addListener(callback);
};

const sendMessage = (extId, message, options, callback) => {
  chrome.runtime.sendMessage(extId, message, options, callback);
};

const sendTabRequest = (tabId, request, callback) => {
  chrome.tabs.sendRequest(tabId, request, callback);
};

const activeTab = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, callback);
};

const newTab = (location) => {
  chrome.tabs.create({ url: location });
};

const updatedTab = (callback) => {
  chrome.tabs.onUpdated.addListener(callback);
};

export {
  messenger,
  getURL,
  storage,
  button,
  listen,
  sendMessage,
  sendTabRequest,
  activeTab,
  newTab,
  updatedTab,
};
