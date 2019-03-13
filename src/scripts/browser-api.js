import Messenger from 'ext-messenger';

const messenger = new Messenger();

const host = `http://${document.domain}`;

const storage = (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);

const button = (callback) => {
  chrome.browserAction.onClicked.addListener(callback);
};

const listen = (callback) => {
  chrome.runtime.onMessage.addListener(callback);
};

const sendRequest = (extId, message, options, callback) => {
  chrome.runtime.sendMessage(extId, message, options, callback);
};

const sendTabRequest = (tabId, request, callback) => {
  chrome.tabs.sendRequest(tabId, request, callback);
};

const activeTab = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, callback);
};

const updatedTab = (callback) => {
  chrome.tabs.onUpdated.addListener(callback);
};

export {
  messenger,
  host,
  storage,
  button,
  listen,
  sendRequest,
  sendTabRequest,
  activeTab,
  updatedTab,
};
