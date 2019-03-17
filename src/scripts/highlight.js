import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';
import Cookies from 'js-cookie';
import { storage } from './utils/browser-api';

if (!rangy.initialized) {
  rangy.init();
}


const highlighter = rangy.createHighlighter();
const cookieName = 'rangySerializedSelection';

const restoreHighlight = () => {
  try {
  } catch (e) {
    console.log('ERROR', e);
  }
};

if (document.readyState !== 'loading') {
  restoreHighlight();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    restoreHighlight();
  });
}

const removeHighlight = (el) => {
  highlighter.removeHighlights(el);
  // classApplier.undoToRange(range);
  storage.remove(cookieName);
  console.log('Removed highlight', el);
};

const doHighlight = (selection) => {
  const classApplier = rangy.createClassApplier('highlight');
  highlighter.addClassApplier(classApplier);
  highlighter.highlightSelection('highlight', selection);

  // classApplier.applyToSelection();
  // classApplier.applyToRange(range);

  const highlight = highlighter.highlights[highlighter.highlights.length - 1];
  // eslint-disable-next-line max-len
  const highlightElements = highlighter.highlights[highlighter.highlights.length - 1].getHighlightElements();

  highlightElements.forEach((el) => {
    // console.log(highlighter.getHighlightForElement(el));

    el.addEventListener('click', () => {
      removeHighlight([highlight]);
    });
  });
};

const createHighlight = (e, throttle = false) => {
  // Detect double & triple mouse click
  if (e.detail === 2 && !throttle) {
    // double click!
    setTimeout(() => createHighlight(e, true), 300);
    return;
  }

  // Get selection object
  const selection = rangy.getSelection();
  if (selection.toString().length === 0 || selection.isCollapsed) {
    return;
  }
  const selectionStr = selection.toString();

  // Get range objects
  const ranges = selection.getAllRanges();
  const range = selection.rangeCount ? selection.getRangeAt(0) : null;
  const rangeStr = range.toString();
  const rangeHtml = range.toHtml();


  // Highlighter
  doHighlight(selection);


  // Save selection
  const saved = rangy.saveSelection();
  // console.log('savedSel', saved);

  // const saved = rangy.saveRange(range);
  // console.log('savedRange', saved);

  const storeJson = JSON.stringify(saved);
  storage.set({ [cookieName]: storeJson });

  setTimeout(() => {
    // Restore from original selection

    // rangy.restoreSelection(saved, true);

    // highlighter.highlightSelection('highlight');
    // const reSelection = rangy.getSelection();
    // reSelection.collapseToEnd();


    // Restore from stored data

    storage.get(cookieName, (resp) => {
      const { [cookieName]: respJson } = resp;
      const respObj = JSON.parse(respJson);

      Object.keys(respObj.rangeInfos).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(respObj.rangeInfos[key], 'document')) {
          respObj.rangeInfos[key].document = window.document;
        }
      });

      rangy.restoreSelection(respObj, true);
      highlighter.highlightSelection('highlight');
      const restoredSelection = rangy.getSelection();
      highlighter.highlightSelection('highlight', restoredSelection);
      selection.collapseToEnd();
    });
  }, 3000);

  // Deselect
  selection.collapseToEnd();
};

export default createHighlight;
