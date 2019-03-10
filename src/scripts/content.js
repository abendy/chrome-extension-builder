import Messenger from 'ext-messenger';
import ext from './browser-api';

/* messenger */

const messenger = new Messenger();

const messageHandler = (message, from, sender, sendResponse) => {
  console.log('from:', from, message);

  if (from === 'background:main') {
    sendResponse(`tab ${message.tab.id} updated`);
  }
};

messenger.initConnection('main', messageHandler);

/* app */

const extractTags = () => {
  const data = {};

  data.url = document.location.href;
  data.title = document.title;

  const descriptionTag = document.querySelector('meta[property=\'og:description\']') || document.querySelector('meta[name=\'description\']');
  if (descriptionTag) {
    data.description = descriptionTag.getAttribute('content');
  }

  return data;
};

function onRequest(request, sender, sendResponse) {
  if (request.action === 'process-page') {
    sendResponse(extractTags());
  }
}

ext.runtime.onMessage.addListener(onRequest);
