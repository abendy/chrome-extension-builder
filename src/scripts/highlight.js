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
const deserializeRegex = /^([^,]+),([^,{]+)(\{([^}]+)\})?$/;

const removeHighlight = (el) => {
  highlighter.removeHighlights(el);
  storage.remove(cookieName);
  console.log('Removed highlight', el);
};

const doHighlight = (selection) => {
  const classApplier = rangy.createClassApplier('highlight');
  highlighter.addClassApplier(classApplier);
  highlighter.highlightSelection('highlight', selection);

  const highlight = highlighter.highlights[highlighter.highlights.length - 1];
  // eslint-disable-next-line max-len
  const highlightElements = highlighter.highlights[highlighter.highlights.length - 1].getHighlightElements();

  highlightElements.forEach((el) => {
    el.addEventListener('click', () => {
      removeHighlight([highlight]);
    });
  });
};

function deserializePosition(serialized, rootNode, doc) {
  const parts = serialized.split(':');
  let node = rootNode;
  const nodeIndices = parts[0] ? parts[0].split('/') : [];
  let i = nodeIndices.length;

  // eslint-disable-next-line no-plusplus
  while (i--) {
    const nodeIndex = parseInt(nodeIndices[i], 10);
    if (nodeIndex < node.childNodes.length) {
      node = node.childNodes[nodeIndex];
    } else {
      throw module.createError(`deserializePosition() failed': node ${rangy.dom.inspectNode(node)} has no child with index ${nodeIndex}, ${i}`);
    }
  }

  return new rangy.dom.DomPosition(node, parseInt(parts[1], 10));
}

function deserializeRange(serialized, rootNode, doc) {
  const result = deserializeRegex.exec(serialized);

  const start = deserializePosition(result[1], rootNode, doc);
  const end = deserializePosition(result[2], rootNode, doc);
  const range = rangy.createRange(doc);
  range.setStartAndEnd(start.node, start.offset, end.node, end.offset);
  return range;
}

function deserializeSelection(serialized, rootNode, win) {
  // eslint-disable-next-line no-param-reassign
  rootNode = window.document.documentElement;

  const serializedRanges = serialized.split('|');
  const sel = rangy.getSelection(window);
  const ranges = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = serializedRanges.length; i < len; ++i) {
    ranges[i] = deserializeRange(serializedRanges[i], rootNode, window.document);
  }
  sel.setRanges(ranges);

  return sel;
}

const restoreHighlight = () => {
  try {
    const cookieData = Cookies.get(cookieName);
    console.log(cookieData);
    const selection = deserializeSelection(cookieData);

    // Highlighter
    doHighlight(selection);

    // Deselect
    selection.collapseToEnd();
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

  // Get range objects
  const ranges = selection.getAllRanges();
  const range = selection.rangeCount ? selection.getRangeAt(0) : null;

  // Save selection
  let serializedRanges = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = ranges.length; i < len; ++i) {
    const rootNode = rangy.DomRange.getRangeDocument(range).documentElement;
    const serialized = `${rangy.serializePosition(ranges[i].startContainer, ranges[i].startOffset, rootNode)},${rangy.serializePosition(ranges[i].endContainer, ranges[i].endOffset, rootNode)}`;
    serializedRanges[i] = serialized;
  }
  serializedRanges = serializedRanges.join('|');
  Cookies.set(cookieName, serializedRanges);

  // Highlighter
  doHighlight(selection);

  // Deselect
  selection.collapseToEnd();
};

export default createHighlight;
