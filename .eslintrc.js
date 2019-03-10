module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "webextensions": true
  },
  "extends": "airbnb-base",
  "globals": {
    "chrome": true
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 6
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-bitwise": 2,
    "no-console": 0,
    "no-use-before-define": 2,
    "no-undef": 2,
    "no-unused-vars": 1,
    "no-case-declarations": 0
  }
};
