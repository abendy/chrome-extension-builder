import { messenger, updatedTab } from './browser-api';

/* messenger */

// eslint-disable-next-line no-unused-vars
const connectedHandler = (extPart, name, tabId) => {};
// eslint-disable-next-line no-unused-vars
const disconnectedHandler = (extPart, name, tabId) => {};

messenger.initBackgroundHub({
  connectedHandler,
  disconnectedHandler,
});

const connection = messenger.initConnection('main');

updatedTab((tabId, changeInfo, tab) => {
  connection.sendMessage(`content_script:main:${tabId}`, {
    action: 'tab-updated',
    tab,
  }).then((response) => {
    console.log('response received:', response);
  });
});
