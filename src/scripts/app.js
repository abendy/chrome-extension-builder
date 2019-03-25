import { messenger } from './utils/browser-api';
import highlight from './highlight';
import { cp } from './utils/app-utils';

const App = {
  init() {
    cp(
      'fetch',
      'mounted',
      'events',
      'messenger',
      'extractPage',
    )(this);

    return this;
  },

  fetch() {
  },

  mounted() {
    highlight.getHighlight(null, 'restoreHighlight');
  },

  events() {
    this.el.addEventListener('click', this.clickHandler.bind(this));
    this.el.addEventListener('mousedown', this.clickHandler.bind(this));
    this.el.addEventListener('mouseup', this.clickHandler.bind(this));
    window.addEventListener('keydown', this.keyBoardHandler.bind(this));
    return this;
  },

  messenger() {
    this.connection = messenger.initConnection('main', this.messageHandler);
  },

  messageHandler(message, from, sender, sendResponse) {
    console.log(`${message.action} from ${from}`, message);

    if (message.context === 'browser' && message.action === 'tab-updated') {
      sendResponse(`tab ${message.tab.id} updated: ${message.tab.title}`);
    }

    if (message.context === 'popup' && message.action === 'process-page') {
      sendResponse(App.extractPage());
    }
  },

  clickHandler(event, throttle = false) {
    const {
      button, detail, target, type,
    } = event;

    if (type === 'mouseup') {
      // Detect double & triple mouse click
      if (detail === 2 && !throttle) {
        // double click!
        setTimeout(() => this.clickHandler(event, true), 300);
        return;
      }

      highlight.newHighlight();
    }
  },

  keyBoardHandler(e) {
    const key = e.keyCode;
  },

  extractPage() {
    this.page_data = {};
    this.page_data.url = window.document.location.href;
    this.page_data.title = window.document.title;

    const descriptionTag = document.querySelector('meta[property=\'og:description\']') || document.querySelector('meta[name=\'description\']');
    if (descriptionTag) {
      this.page_data.description = descriptionTag.getAttribute('content');
    }

    return this.page_data;
  },
};

export default App;
