import Messenger from 'ext-messenger';
import Messages from './messages';

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
    event: Messages.TABS_ON_UPDATED,
    tab,
  });
});

chrome.browserAction.onClicked.addListener((tab) => {
  connection.sendMessage(`content_script:main:${tab.id}`, {
    event: Messages.BROWSERACTION_CLICK,
    windowSelf: window.self === window.top,
    tab,
  }).then((response) => {
    console.log('response', response);
  });
});
import ext from './ext';

console.log('background loaded...');

ext.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'perform-save') {
      console.log('Extension Type: ', '/* @echo extension */');
      console.log('PERFORM AJAX', request.data);

      sendResponse({ action: 'saved' });
    }
  },
);
