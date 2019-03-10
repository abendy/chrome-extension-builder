import Messenger from 'ext-messenger';
import ext from './browser-api';

const messenger = new Messenger();

const messageHandler = (message, from, sender, sendResponse) => {
  if (message.event === 'tabs.onUpdated') {
    console.log(message.event, message.tab);
  }

  if (message.event === 'browserAction.onClicked') {
    console.log(message.event, message.tab);
    sendResponse(`click received on tab ${message.tab.id}`);
  }
};

messenger.initConnection('main', messageHandler);

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
