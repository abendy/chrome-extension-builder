import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import config from 'dotenv';
import api from 'axios';
import Cookies from 'js-cookie';
import { deserializeSelection } from './utils/highlight-utils';

class Highlighter {
  constructor() {
    this.doc = window.document;
    this.rangy = rangy;
    this.rangy.init();

    this.highlighter = this.rangy.createHighlighter();
    this.db_host = process.env.DB_HOST;

    this.selection = null;
    this.ranges = null;
    this.range = null;
    this.highlightId = null;
    this.classApplier = null;
  }

  setHighlightId(highlightId) {
    this.highlightId = highlightId;
    if (!highlightId) {
      this.highlightId = `highlight_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
    }
    this.classApplier = this.rangy.createClassApplier(this.highlightId);
    this.highlighter.addClassApplier(this.classApplier, true);
  }

  removeHighlight(lastEl, highlightId, range) {
    // Remove .remove element
    lastEl.removeChild(lastEl.lastElementChild);

    this.setHighlightId(highlightId);
    this.classApplier.undoToRange(range);

    Cookies.remove(this.highlightId);
  }

  setRanges() {
    // Get range objects
    this.ranges = this.selection.getAllRanges();
    this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;
  }

  doHighlight() {
    // Add highlight
    this.highlighter.highlightSelection(this.highlightId, this.selection);

    try {
      this.rangy.isRangeValid(this.range);
    } catch (e) {
      this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;
    }

    // Set highlight to DOM range in browser
    this.classApplier.applyToRange(this.range);

    // eslint-disable-next-line max-len
    const highlightElements = this.highlighter.highlights[this.highlighter.highlights.length - 1].getHighlightElements();

    const lastEl = highlightElements[highlightElements.length - 1];
    const { highlightId, range } = this;

    // Set remove button with click event
    const remove = document.createElement('span');
    remove.className = 'remove';
    remove.textContent = 'remove';
    remove.addEventListener('click', () => {
      this.removeHighlight(lastEl, highlightId, range);
    });
    lastEl.append(remove);

    // Hover over highlight elements to display remove button
    highlightElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const lastElChildEl = lastEl.childNodes[lastEl.childNodes.length - 1];
        if (lastElChildEl.tagName.toLowerCase() === 'span' && lastElChildEl.className.toLowerCase() === 'remove') {
          lastEl.childNodes[lastEl.childNodes.length - 1].classList.add('active');
        }
      });
      el.addEventListener('mouseleave', () => {
        lastEl.childNodes[lastEl.childNodes.length - 1].classList.remove('active');
      });
    });

    // Deselect
    this.selection.collapseToEnd();

    // Reset
    this.selection = null;
    this.ranges = null;
    this.range = null;
    this.highlightId = null;
    this.classApplier = null;
  }

  restoreHighlight() {
    try {
      const cookies = Cookies.get();

      Object.keys(cookies).forEach((key) => {
        // Get selection object
        this.selection = deserializeSelection(cookies[key], this.doc);
        this.setRanges();

        // Set highlight ID
        const [, highlightId] = /^(highlight_[A-Za-z0-9]+)$/.exec(key);
        this.setHighlightId(highlightId);

        // Highlighter
        this.doHighlight();
      });
    } catch (e) {
      console.log('ERROR', e);
    }
  }

  saveHighlight() {
    let serializedRanges = [];
    Object.keys(this.ranges).forEach((i) => {
      const rootNode = this.rangy.DomRange.getRangeDocument(this.ranges[i]).documentElement;
      const serialized = `${this.rangy.serializePosition(this.ranges[i].startContainer, this.ranges[i].startOffset, rootNode)},${this.rangy.serializePosition(this.ranges[i].endContainer, this.ranges[i].endOffset, rootNode)}`;
      serializedRanges[i] = serialized;
    });
    serializedRanges = serializedRanges.join('|');
    Cookies.set(this.highlightId, serializedRanges);
  }

  newHighlight(e, target, throttle = false) {
    // Detect double & triple mouse click
    if (e.detail === 2 && !throttle) {
      // double click!
      setTimeout(() => this.newHighlight(e, true), 300);
      return;
    }

    // Get selection object
    this.selection = this.rangy.getSelection();
    this.setRanges();

    // Test selection object
    if (this.selection.toString().length === 0 || this.selection.isCollapsed) {
      return;
    }

    // Set highlight ID
    this.setHighlightId();

    // Save selection
    this.saveHighlight();

    // Highlighter
    this.doHighlight();
  }
}

const highlight = new Highlighter();

export default highlight;
