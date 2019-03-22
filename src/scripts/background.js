import { messenger, onUpdatedTab } from './utils/browser-api';

/* messenger */

const connectedHandler = (extPart, name, tabId) => {};
const disconnectedHandler = (extPart, name, tabId) => {};

messenger.initBackgroundHub({
  connectedHandler,
  disconnectedHandler,
});

const connection = messenger.initConnection('main');

onUpdatedTab((tabId, changeInfo, tab) => {
  connection.sendMessage(`content_script:main:${tabId}`, {
    action: 'tab-updated',
    tab,
  }).then((response) => {
    console.log('response received:', response);
  });
});
