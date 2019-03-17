import { messenger } from './utils/browser-api';
import createHighlight from './highlight';

/* highlighter */

// mouse up event
document.addEventListener('mouseup', (e) => {
  createHighlight(e);
}, false);

/* app */

const extractedTags = () => {
  const data = {};

  data.url = document.location.href;
  data.title = document.title;

  const descriptionTag = document.querySelector('meta[name=\'description\']');
  if (descriptionTag) {
    data.description = descriptionTag.getAttribute('content');
  }

  return data;
};

/* messenger */

const messageHandler = (message, from, sender, sendResponse) => {
  console.log('from:', from, message);

  if (message.action === 'tab-updated') {
    sendResponse(`tab ${message.tab.id} updated: ${message.tab.title}`);
  }

  if (message.action === 'process-page') {
    sendResponse(extractedTags());
  }
};

messenger.initConnection('main', messageHandler);
