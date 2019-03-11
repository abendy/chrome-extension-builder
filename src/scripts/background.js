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
    action: 'tab-updated',
    tab,
  }).then((response) => {
    console.log('response received:', response);
  });
});
