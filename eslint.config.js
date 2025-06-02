const js = require('@eslint/js');
const globals = require('globals');
const { defineConfig, globalIgnores } = require('eslint/config');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = defineConfig([
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.log', '**/.env*']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    extends: [js.configs.recommended],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },
  eslintConfigPrettier,
]);
