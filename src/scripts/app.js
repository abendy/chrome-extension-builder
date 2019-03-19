import highlight from './highlight';
import { cp } from './utils/util';

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
};

export default App;
