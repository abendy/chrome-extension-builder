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
      throw module.createError(`deserializePosition() failed': node ${rangy.dom.inspectNode(node)} has no child with index ${nodeIndex}, ${i}`);
    }
  }

  return new rangy.dom.DomPosition(node, parseInt(parts[1], 10));
};

export const deserializeRange = (serialized, rootNode, doc) => {
  const result = deserializeRegex.exec(serialized);

  const start = deserializePosition(result[1], rootNode);
  const end = deserializePosition(result[2], rootNode);
  const range = rangy.createRange(doc);
  range.setStartAndEnd(start.node, start.offset, end.node, end.offset);
  return range;
};

export const deserializeSelection = (serialized, doc) => {
  const rootNode = doc.documentElement;

  const serializedRanges = serialized.split('|');
  const sel = rangy.getSelection(window);
  const ranges = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = serializedRanges.length; i < len; ++i) {
    ranges[i] = deserializeRange(serializedRanges[i], rootNode, doc);
  }
  sel.setRanges(ranges);

  return sel;
};
