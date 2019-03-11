module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "webextensions": true
  },
  "extends": [
    "airbnb-base",
    "plugin:react/recommended"
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "jsx": true
    }
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
    "no-case-declarations": 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx'] }
    ],
  },
  "plugins": [
    "react"
  ],
  "settings": {
    "react": {
      "version": "detect",
    },
  },
};
