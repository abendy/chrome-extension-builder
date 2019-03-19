import highlight from './highlight';
import { cp } from './utils/app-utils';

const App = {
  init() {
    cp(
      'initEvent',
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

  extractedTags() {
    const data = {};

    data.url = document.location.href;
    data.title = document.title;

    const descriptionTag = document.querySelector('meta[property=\'og:description\']') || document.querySelector('meta[name=\'description\']');
    if (descriptionTag) {
      data.description = descriptionTag.getAttribute('content');
    }

    return data;
  },
};

export default App;
