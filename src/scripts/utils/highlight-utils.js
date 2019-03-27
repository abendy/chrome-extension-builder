import rangy from 'rangy-updated';

export const serializePosition = (node, offset, rootNode) => {
  const pathParts = [];
  let n = node;

  while (n && n !== rootNode) {
    pathParts.push(rangy.dom.getNodeIndex(n, true));
    n = n.parentNode;
  }

  return `${pathParts.join('/')}:${offset}`;
};

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
      throw new Error(`deserializePosition() failed: node ${rangy.dom.inspectNode(node)} has no child with index ${nodeIndex}, ${i}`);
    }
  }

  return new rangy.dom.DomPosition(node, parseInt(parts[1], 10));
};

export const deserializeRange = (serialized, rootNode, doc) => {
  const result = /^([^,]+),([^,{]+)(\{([^}]+)\})?$/.exec(serialized);
  const start = deserializePosition(result[1], rootNode, doc);
  const end = deserializePosition(result[2], rootNode, doc);
  const range = rangy.createRange(doc);
  range.setStartAndEnd(start.node, start.offset, end.node, end.offset);
  return range;
};

export const deserializeSelection = (serializedRange, rootNode, win) => {
  const sel = rangy.getSelection(win);

  const range = deserializeRange(serializedRange, rootNode.documentElement, win.document);

  sel.addRange(range);

  return sel;
};
