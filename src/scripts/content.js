import { messenger } from './browser-api';

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
    sendResponse(`tab ${message.tab.id} updated`);
  }

  if (message.action === 'process-page') {
    sendResponse(extractedTags());
  }
};

messenger.initConnection('main', messageHandler);
