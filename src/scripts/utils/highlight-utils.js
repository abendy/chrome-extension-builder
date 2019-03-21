import rangy from 'rangy-updated';

const deserializeRegex = /^([^,]+),([^,{]+)(\{([^}]+)\})?$/;

export const deserializePosition = (serialized, rootNode) => {
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
      throw module.createError(`deserializePosition() failed: node ${rangy.dom.inspectNode(node)} has no child with index ${nodeIndex}, ${i}`);
    }
  }

  return new rangy.dom.DomPosition(node, parseInt(parts[1], 10));
};

export const deserializeRange = (serialized, rootNode, doc) => {
  const result = deserializeRegex.exec(serialized);
  const start = deserializePosition(result[1], rootNode, doc);
  const end = deserializePosition(result[2], rootNode, doc);
  const range = rangy.createRange(doc);
  range.setStartAndEnd(start.node, start.offset, end.node, end.offset);
  return range;
};

export const deserializeSelection = (serialized, rootNode, win) => {
  const serializedRanges = serialized.split('|');
  const sel = rangy.getSelection(win);
  const ranges = [];

  Object.keys(serializedRanges).forEach((i) => {
    ranges[i] = deserializeRange(serializedRanges[i], rootNode.documentElement, win.document);
  });

  sel.setRanges(ranges);

  return sel;
};
