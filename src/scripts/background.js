import Messenger from 'ext-messenger';
import Messages from './messages';

const messenger = new Messenger();

const connectedHandler = (extPart, name, tabId) => {
  console.log('connected.', { extPart, name, tabId });
};

const disconnectedHandler = (extPart, name, tabId) => {
  console.log('disconnected.', { extPart, name, tabId });
};

messenger.initBackgroundHub({
  connectedHandler,
  disconnectedHandler,
});

// first install
// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('installed...');
  }
});

const messageHandler = (message, from, sender, sendResponse) => {
  const response = {
    'background message': message,
    'background from': from,
    'background sender': sender,
  };
  // console.log(response);
  sendResponse({ 'background response': response });
};

const connection = messenger.initConnection('main', messageHandler);

// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  connection.sendMessage(`content_script:main:${tabId}`, {
    name: Messages.TAB_ON_UPDATED,
    tabId,
    changeInfo,
    tab,
  });
});
