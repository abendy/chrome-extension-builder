import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import api from 'axios';
import Cookies from 'js-cookie';
import { serializePosition, deserializeSelection } from './utils/highlight-utils';

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
    this.highlights = {};
  }

  reset() {
    delete this.classApplier;
    delete this.highlightId;
    delete this.parentEl;
    delete this.range;
    delete this.rangeHtml;
    delete this.rangeStr;
    delete this.selection;
  }

  setHighlightId(highlightId) {
    this.highlightId = highlightId;
    if (!highlightId) {
      this.highlightId = `highlight_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
    }

    const config = {
      applyToAnyTagName: true,
      elementTagName: 'span',
    };
    this.classApplier = this.rangy.createClassApplier(this.highlightId, config);

    this.highlighter.addClassApplier(this.classApplier, true);
  }

  removeHighlight(lastEl, highlightElements, highlightId, range) {
    // Remove .remove element
    lastEl.removeChild(lastEl.lastElementChild);

    // We need to remove the `highlight` first or undoToRange won't completely remove the highlight
    [].forEach.call(highlightElements, el => el.classList.remove('highlight'));

    this.setHighlightId(highlightId);
    this.classApplier.undoToRange(range);

    // Remove highlight from class
    delete this.highlights[highlightId];

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

  setRange() {
    // Get range object
    this.range = this.selection.rangeCount ? this.selection.getRangeAt(0) : null;
    this.rangeStr = this.range.toString();
    this.rangeHtml = this.range.toHtml();

    if (this.selection.rangeCount > 0) {
      const { commonAncestorContainer } = this.range;
      this.parentEl = commonAncestorContainer; // nodeType === 1 i.e. Element

      if (commonAncestorContainer.nodeType === 3) { // Text
        this.parentEl = commonAncestorContainer.parentNode;
      }

      // Set parent data attribute
      this.parentEl.setAttribute('data-parent-for', this.highlightId);
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

    // Add general highlight class
    [].forEach.call(highlightElements, el => el.classList.add('highlight'));

    // Save highlight elements to class
    // eslint-disable-next-line max-len
    this.highlights[this.highlightId] = { ...this.highlights[this.highlightId], ...{ highlightElements } };

    const lastEl = highlightElements[highlightElements.length - 1];
    const { highlightId, range } = this;

    // Set remove button with click event
    const remove = document.createElement('span');
    remove.className = 'remove';
    remove.textContent = 'remove';
    remove.addEventListener('click', () => {
      this.removeHighlight(lastEl, highlightElements, highlightId, range);
    });
    lastEl.append(remove);

    // Hover over highlight elements to display remove button
    highlightElements.forEach((el) => {
      const lastElLastChildEl = lastEl.childNodes[lastEl.childNodes.length - 1];

      el.addEventListener('mouseenter', () => {
        if (typeof lastElLastChildEl === 'undefined') {
          return;
        }

        if (lastElLastChildEl.tagName === 'SPAN' && lastElLastChildEl.className === 'remove') {
          lastElLastChildEl.classList.add('active');
        }
      });
      el.addEventListener('mouseleave', () => {
        lastElLastChildEl.classList.remove('active');
      });
    });

    // Deselect
    this.selection.collapseToEnd();
  }

  restoreHighlight() {
    // Highlighter
    this.doHighlight();

    // Reset object
    this.reset();
  }

  getHighlight(highlightId = null, callback = null) {
    // Get highlight data from database.
    api
      .post(`${this.db_host}/api/get/`, {
        hostname: this.hostname,
        highlight_id: highlightId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        let highlights = response.data;

        if (typeof highlights === 'string') {
          highlights = { [highlightId]: highlights };
        }

        Object.keys(highlights).forEach((key) => {
          const highlight = JSON.parse(highlights[key]);

          // Set highlight ID
          // eslint-disable-next-line no-param-reassign
          [, highlightId] = /^(highlight_[A-Za-z0-9]+)$/.exec(key);
          this.setHighlightId(highlightId);

          // Save highlight to class
          this.highlights = { ...this.highlights, ...{ [highlightId]: highlight } };

          // Get selection object
          this.selection = deserializeSelection(highlight.serializedRange, this.doc, this.win);
          this.setRange();

          this[callback]();
        });
      })
      .catch((error) => {
        console.log('get error', error);
      });
  }

  saveHighlight() {
    // Serialize range
    const rootNode = this.rangy.DomRange.getRangeDocument(this.range).documentElement;
    const serializedRange = `${serializePosition(this.range.startContainer, this.range.startOffset, rootNode)},${serializePosition(this.range.endContainer, this.range.endOffset, rootNode)}`;

    // Prepare data for storage
    const rangeStr = JSON.stringify(this.rangeStr);
    const rangeHtml = JSON.stringify(this.rangeHtml);
    const parentEl = JSON.stringify(this.parentEl);
    const location = JSON.stringify(this.location);

    const postData = {
      [this.highlightId]: {
        serializedRange,
        rangeStr,
        rangeHtml,
        parentEl,
        location,
      },
    };

    // Save highlight to class
    this.highlights = { ...this.highlights, ...postData };

    // Store data
    Cookies.set(this.highlightId, serializedRange);

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

  newHighlight() {
    // Set highlight ID
    this.setHighlightId();

    // Get selection object
    this.selection = this.rangy.getSelection();
    // Set range object
    this.setRange();

    // Test selection object for: 0 char length OR if text has been de-selected
    if (this.selection.toString().length <= 2 || this.selection.isCollapsed) {
      return;
    }

    if (this.rangeHtml.indexOf('highlight') > -1) {
      // TODO alert user
      throw new Error('Highlights are overlapping');
    }

    // Save selection
    this.saveHighlight();

    // Highlighter
    this.doHighlight();

    // Reset object
    this.reset();
  }
}

const highlighter = new Highlighter();

export default highlighter;
