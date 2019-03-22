import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import api from 'axios';
import Cookies from 'js-cookie';
import { deserializeSelection } from './utils/highlight-utils';

class Highlighter {
  constructor() {
    this.win = window;
    this.doc = this.win.document;
    this.rangy = rangy;
    this.rangy.init();

    this.db_host = process.env.DB_HOST;

    this.location = this.doc.location;
    this.hostname = this.location.hostname;

    this.highlighter = this.rangy.createHighlighter();
  }

  setHighlightId(highlightId) {
    this.highlightId = highlightId;
    if (!highlightId) {
      this.highlightId = `highlight_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
    }

    const config = {
      tagNames: ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'address', 'article', 'blockquote', 'dd', 'dl', 'dt', 'picture', 'figure', 'figcaption', 'li', 'ol', 'ul', 'pre', 'p', 'abbr', 'cite', 'code', 'dfn', 'em', 'i', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u'],
      elementTagName: 'span',
    };
    this.classApplier = this.rangy.createClassApplier(this.highlightId, config);

    this.highlighter.addClassApplier(this.classApplier, true);
  }

  removeHighlight(lastEl, highlightId, range) {
    // Remove .remove element
    lastEl.removeChild(lastEl.lastElementChild);

    this.setHighlightId(highlightId);
    this.classApplier.undoToRange(range);

    // Delete data from database
    Cookies.remove(this.highlightId);

    api
      .post(`${this.db_host}/api/delete/`, {
        hostname: this.hostname,
        highlight_id: this.highlightId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log('delete response', response);
      })
      .catch((error) => {
        console.log('delete error', error);
      });
  }

  setRanges() {
    // Get range objects
    this.ranges = this.selection.getAllRanges();

    this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;
    this.rangeStr = this.range.toString();
    this.rangeHtml = this.range.toHtml();

    if (this.selection.rangeCount > 0) {
      const parentEl = this.range.commonAncestorContainer;

      if (parentEl.nodeType === 3) { // Text
        this.parentEl = parentEl.parentNode;
      } else if (parentEl.nodeType === 1) { // Element
        this.parentEl = parentEl;
      }
    }
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
  }

  restoreHighlight() {
    // Get highlight data from database.
    const { hostname } = this;

    api
      .post(`${this.db_host}/api/get/`, {
        hostname,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const highlights = response.data;

        Object.keys(highlights).forEach((key) => {
          const highlight = JSON.parse(highlights[key]);

          // Get selection object
          this.selection = deserializeSelection(highlight.serializedRanges, this.doc, this.win);
          this.setRanges();

          // Set highlight ID
          const [, highlightId] = /^(highlight_[A-Za-z0-9]+)$/.exec(key);
          this.setHighlightId(highlightId);

          // Highlighter
          this.doHighlight();
        });
      })
      .catch((error) => {
        console.log('get error', error);
      });
  }

  saveHighlight() {
    let serializedRanges = [];
    Object.keys(this.ranges).forEach((i) => {
      const rootNode = this.rangy.DomRange.getRangeDocument(this.ranges[i]).documentElement;
      const serialized = `${this.rangy.serializePosition(this.ranges[i].startContainer, this.ranges[i].startOffset, rootNode)},${this.rangy.serializePosition(this.ranges[i].endContainer, this.ranges[i].endOffset, rootNode)}`;
      serializedRanges[i] = serialized;
    });
    serializedRanges = serializedRanges.join('|');

    // Prepare data for storage
    const rangeStr = JSON.stringify(this.rangeStr);
    const rangeHtml = JSON.stringify(this.rangeHtml);
    const parentEl = JSON.stringify(this.parentEl);
    const location = JSON.stringify(this.location);

    const postData = {
      [this.highlightId]: {
        serializedRanges,
        rangeStr,
        rangeHtml,
        parentEl,
        location,
      },
    };

    // Store data
    Cookies.set(this.highlightId, serializedRanges);

    api
      .post(`${this.db_host}/api/save/`, {
        [this.hostname]: postData,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log('post response', response);
      })
      .catch((error) => {
        console.log('post error', error);
      });
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
