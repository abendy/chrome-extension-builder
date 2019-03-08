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
