import highlight from './highlight';
import { cp } from './utils/app-utils';

const App = {
  init() {
    cp(
      'initEvent',
      'extractPage',
      'mounted',
    )(this);

    return this;
  },

  initEvent() {
    this.el.addEventListener('click', this.clickHandler.bind(this));
    window.addEventListener('keydown', this.keyBoardHandler.bind(this));
    return this;
  },

  mounted() {
    highlight.restoreHighlight();
  },

  clickHandler(e) {
    const { target } = e;

    highlight.newHighlight(e, target);
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
