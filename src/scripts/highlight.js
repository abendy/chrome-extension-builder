import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';

if (!rangy.initialized) {
  rangy.init();
}

const createHighlight = (e, throttle = false) => {
  // Get selection object
  const selection = rangy.getSelection();

  // Detect double & triple mouse click
  if (e.detail === 2 && !throttle) {
    // double click!
    setTimeout(() => createHighlight(e, true), 300);
    return;
  }

  if (selection.toString().length === 0 || selection.isCollapsed) {
    return;
  }

  // Highlighter
  const highlighter = rangy.createHighlighter();
  const classApplier = rangy.createClassApplier('highlight');
  highlighter.addClassApplier(classApplier);
  highlighter.highlightSelection('highlight', selection);

  const highlight = highlighter.highlights[highlighter.highlights.length - 1];
  // eslint-disable-next-line max-len
  const highlightElements = highlighter.highlights[highlighter.highlights.length - 1].getHighlightElements();

  highlightElements.forEach((el) => {
    el.addEventListener('click', () => {
      highlighter.removeHighlights([highlight]);
      console.log(`Removed ${highlight.id}`);
    });
  });
  // Deselect

  selection.collapseToEnd();
};

export default createHighlight;
