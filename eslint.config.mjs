import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierlint from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/consistent-type-definitions': ['off'],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'build/', '.esbuild/', '.prettierrc.js', 'config/'],
  },
  prettierlint,
);
