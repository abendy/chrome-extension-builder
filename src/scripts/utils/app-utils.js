export const cp = (...fns) => (context = window) => {
  fns.forEach((fn) => {
    if (typeof context[fn] === 'function') {
      context[fn].call(context);
    }
  });
};

export const getParent = (m, name) => (m.props.name === name ? m : getParent(m.context, name));

// eslint-disable-next-line max-len
export const nodeHasChildren = (n, selector) => Array.from(n.children).some(c => c.matches(selector));

export const findParent = (node, selector, boundary) => {
  const p = node.parentNode;

  if (!p.matches(selector)) {
    return p === document.body || p.matches(boundary) ? null : findParent(p, selector, boundary);
  }

  return p;
};

// eslint-disable-next-line max-len
export const elementVisible = element => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
