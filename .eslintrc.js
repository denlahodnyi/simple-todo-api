module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 1,
    'no-underscore-dangle': 0,
    'max-classes-per-file': 0,
    'import/no-extraneous-dependencies': 0,
  },
};
