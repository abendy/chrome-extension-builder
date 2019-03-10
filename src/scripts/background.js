import Messenger from 'ext-messenger';
import ext from './browser-api';

/* messenger */

const messenger = new Messenger();

const connectedHandler = (extPart, name, tabId) => {};
const disconnectedHandler = (extPart, name, tabId) => {};

messenger.initBackgroundHub({
  connectedHandler,
  disconnectedHandler,
});

const connection = messenger.initConnection('main');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  connection.sendMessage(`content_script:main:${tabId}`, {
    message: `tab ${tabId} updated`,
    tab,
  }).then((response) => {
    console.log('response received:', response);
  });
});

/* app */

// chrome.browserAction.onClicked.addListener((tab) => {
// });

ext.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'perform-save') {
      console.log('Extension Type: ', '/* @echo extension */');
      console.log('PERFORM AJAX', request.data);

      sendResponse({ action: 'saved' });
    }
  },
);
