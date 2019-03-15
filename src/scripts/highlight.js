import rangy from 'rangy-updated';
import { rangyHighlight as Highlight } from 'rangy-updated/lib/rangy-highlighter';
import { rangyClassApplier as ClassApplier } from 'rangy-updated/lib/rangy-classapplier';
import { rangyTextRange as Range } from 'rangy-updated/lib/rangy-textrange';
import { rangySerializer as Serializer } from 'rangy-updated/lib/rangy-serializer';
import { rangySelectionsaverestore as Saver } from 'rangy-updated/lib/rangy-selectionsaverestore';


if (!rangy.initialized) {
  rangy.init();
  console.log('rangy', rangy.initialized ? 'init' : 'did not start');
}

// Highlighter
const highlighter = rangy.createHighlighter();

highlighter.addClassApplier(rangy.createClassApplier('note', {
  ignoreWhiteSpace: true,
  // tagNames: ["span", "a"],
  elementTagName: 'a',
  elementProperties: {
    href: '#',
    // onclick: () => {
    //   console.log(highlighter.getRange());

    //   // highlight.unapply();
    //   // this.highlights.splice(i--, 1);

    //   // const highlight = highlighter.getHighlightForElement(this);
    //   // console.log(highlight);
    //   // highlighter.removeHighlights([highlight]);
    //   return false;
    // },
  },
}));

const createHighlight = (e, throttle = false) => {
  // Get rangy selection object
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

  // Selection string
  console.log(selection.toString());
  console.log(selection.inspect());

  // Get first range
  // const range = selection.rangeCount ? selection.getRangeAt(0) : null;
  // console.log(range);

  const highlight = highlighter.highlightSelection('note');
  console.log(highlight);

  // const highlight = highlighter.getHighlightForElement(this);
  // console.log(highlight);

  // highlighter.highlights.forEach((highlight) => {
  //   console.log(highlight);
  // });

  // // remove note
  // [].forEach.call(document.querySelectorAll('.note'), (el) => {
  //   el.addEventListener('click', () => {
  //     console.log('hi');
  //     highlighter.unhighlightSelection();
  //   });
  // });
};

export default createHighlight;
