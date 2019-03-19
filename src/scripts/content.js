import { messenger } from './utils/browser-api';
import App from './app';

/* app */

const app = (proto, ext) => Object.assign(Object.create(proto), ext);

const bodyEl = document.querySelector('body');
const ext = {
  el: bodyEl,
};

if (document.readyState !== 'loading') {
  app(App, ext).init();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    app(App, ext).init();
  });
}

/* messenger */

const messageHandler = (message, from, sender, sendResponse) => {
  console.log('from:', from, message);

  if (message.action === 'tab-updated') {
    sendResponse(`tab ${message.tab.id} updated: ${message.tab.title}`);
  }

  if (message.action === 'process-page') {
    sendResponse(App.extractedTags());
  }
};

messenger.initConnection('main', messageHandler);
