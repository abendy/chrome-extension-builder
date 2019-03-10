import storage from './storage';

const colorSelectors = document.querySelectorAll('.js-radio');

const setColor = (color) => {
  document.body.style.backgroundColor = color;
};

storage.get('color', (resp) => {
  const { color } = resp;
  let option;
  if (color) {
    option = document.querySelector(`.js-radio.${color}`);
    setColor(color);
  } else {
    [option] = colorSelectors;
  }

  option.setAttribute('checked', 'checked');
});

colorSelectors.forEach((el) => {
  el.addEventListener('click', () => {
    const { value } = el;
    storage.set({ color: value }, () => {
      setColor(value);
    });
  });
});
