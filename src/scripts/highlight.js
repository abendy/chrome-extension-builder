import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import Cookies from 'js-cookie';
import { deserializeSelection } from './utils/highlight-helper';

class Highlighter {
  constructor() {
    this.doc = window.document;
    this.rangy = rangy;
    this.rangy.init();

    // Set temp. ID
    this.tempId = `highlight_${Math.random().toString(36).substring(2, 15)}`;

    this.highlighter = this.rangy.createHighlighter();

    this.selection = null;
    this.ranges = null;
    this.range = null;
  }

  removeHighlight(highlightElements, el) {
    highlightElements.forEach((highlightEl) => {
      // Remove .hightlight class
      highlightEl.classList.remove('highlight');
    });

    // Remove .remove el
    el.removeChild(el.lastElementChild);

    const classApplier = this.rangy.createClassApplier(this.tempId);
    classApplier.undoToRange(this.range);

    Cookies.remove(this.tempId);
  }

  doHighlight() {
    const classApplier = this.rangy.createClassApplier(this.tempId);
    this.highlighter.addClassApplier(classApplier, true);
    this.highlighter.highlightSelection(this.tempId, this.selection);

    try {
      this.rangy.isRangeValid(this.range);
    } catch (e) {
      // eslint-disable-next-line no-param-reassign
      this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;
    }

    classApplier.applyToRange(this.range);

    // eslint-disable-next-line max-len
    const highlightElements = this.highlighter.highlights[this.highlighter.highlights.length - 1].getHighlightElements();

    highlightElements.forEach((el) => {
      // Add .hightlight class
      el.classList.add('highlight');
    });

    const lastEl = highlightElements[highlightElements.length - 1];
    const remove = document.createElement('span');
    remove.className = 'remove';
    remove.textContent = 'remove';
    lastEl.addEventListener('click', () => {
      this.removeHighlight(highlightElements, lastEl);
    });
    lastEl.append(remove);

    // Deselect
    this.selection.collapseToEnd();
  }

  restoreHighlight() {
    try {
      const cookies = Cookies.get();

      Object.keys(cookies).forEach((key) => {
        const [, tempId] = /^(highlight_[A-Za-z0-9]+)$/.exec(key);
        this.tempId = tempId;

        this.selection = deserializeSelection(cookies[key], this.doc);
        this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;

        // Highlighter
        this.doHighlight();
      });
    } catch (e) {
      console.log('ERROR', e);
    }
  }

  newHighlight(e, throttle = false) {
    // Detect double & triple mouse click
    if (e.detail === 2 && !throttle) {
      // double click!
      setTimeout(() => this.newHighlight(e, true), 300);
      return;
    }

    // Get selection object
    this.selection = this.rangy.getSelection();
    if (this.selection.toString().length === 0 || this.selection.isCollapsed) {
      return;
    }

    // Get range objects
    this.ranges = this.selection.getAllRanges();
    this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;

    // Save selection
    let serializedRanges = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = this.ranges.length; i < len; ++i) {
      const rootNode = this.rangy.DomRange.getRangeDocument(this.ranges[i]).documentElement;
      const serialized = `${this.rangy.serializePosition(this.ranges[i].startContainer, this.ranges[i].startOffset, rootNode)},${this.rangy.serializePosition(this.ranges[i].endContainer, this.ranges[i].endOffset, rootNode)}`;
      serializedRanges[i] = serialized;
    }
    serializedRanges = serializedRanges.join('|');
    Cookies.set(this.tempId, serializedRanges);

    // Highlighter
    this.doHighlight();
  }
}

const highlight = new Highlighter();

export default highlight;
