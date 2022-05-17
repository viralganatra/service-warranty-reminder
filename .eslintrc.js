module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'node/no-unsupported-features/es-syntax': ['off'],
    'node/no-missing-import': ['off'],
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['aws-sdk-client-mock'],
      },
    ],
  },
};
