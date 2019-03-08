import ext from './ext';

console.log('content loaded...');

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
