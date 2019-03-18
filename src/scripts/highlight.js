import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import Cookies from 'js-cookie';
import { deserializeSelection } from './utils/highlight-helper';

class Highlighter {
  constructor() {
    this.rangy = rangy;
    this.rangy.init();

    this.highlighter = this.rangy.createHighlighter();
  }

  removeHighlight(highlightElements, range, el, tempId) {
    highlightElements.forEach((highlightEl) => {
      // Remove .hightlight class
      highlightEl.classList.remove('highlight');
    });

    // Remove .remove el
    el.removeChild(el.lastElementChild);

    const classApplier = this.rangy.createClassApplier(tempId);
    classApplier.undoToRange(range);

    Cookies.remove(tempId);
  }

  doHighlight(selection, range, tempId) {
    const classApplier = this.rangy.createClassApplier(tempId);
    this.highlighter.addClassApplier(classApplier, true);
    this.highlighter.highlightSelection(tempId, selection);

    try {
      this.rangy.isRangeValid(range);
    } catch (e) {
      // eslint-disable-next-line no-param-reassign
      range = selection.rangeCount ? selection.getRangeAt(0) : null;
    }

    classApplier.applyToRange(range);

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
      this.removeHighlight(highlightElements, range, lastEl, tempId);
    });
    lastEl.append(remove);
  }

  restoreHighlight() {
    try {
      const cookies = Cookies.get();

      Object.keys(cookies).forEach((key) => {
        const [, tempId] = /^(highlight_[A-Za-z0-9]+)$/.exec(key);

        const selection = deserializeSelection(cookies[key], window.document);
        const range = selection.rangeCount ? selection.getRangeAt(0) : null;

        // Highlighter
        this.doHighlight(selection, range, tempId);

        // Deselect
        selection.collapseToEnd();
      });
    } catch (e) {
      console.log('ERROR', e);
    }
  }

  createHighlight(e, throttle = false) {
    // Detect double & triple mouse click
    if (e.detail === 2 && !throttle) {
      // double click!
      setTimeout(() => this.createHighlight(e, true), 300);
      return;
    }

    // Get selection object
    const selection = this.rangy.getSelection();
    if (selection.toString().length === 0 || selection.isCollapsed) {
      return;
    }

    // Get range objects
    const ranges = selection.getAllRanges();
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;

    // Set temp. ID
    const tempId = `highlight_${Math.random().toString(36).substring(2, 15)}`;

    // Save selection
    let serializedRanges = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = ranges.length; i < len; ++i) {
      const rootNode = this.rangy.DomRange.getRangeDocument(ranges[i]).documentElement;
      const serialized = `${this.rangy.serializePosition(ranges[i].startContainer, ranges[i].startOffset, rootNode)},${this.rangy.serializePosition(ranges[i].endContainer, ranges[i].endOffset, rootNode)}`;
      serializedRanges[i] = serialized;
    }
    serializedRanges = serializedRanges.join('|');
    Cookies.set(tempId, serializedRanges);

    // Highlighter
    this.doHighlight(selection, range, tempId);

    // Deselect
    selection.collapseToEnd();
  }
}

const highlight = new Highlighter();

export default highlight;
