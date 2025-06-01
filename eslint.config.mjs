import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import json from '@eslint/json';
import globals from 'globals';

export default defineConfig([
  // 忽略不需檢查的檔案與資料夾
  globalIgnores(['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.log', '**/.env*']),

  // JavaScript 設定
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    plugins: {
      js,
    },
    extends: [js.configs.recommended, 'standard', 'prettier'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
    },
  },

  {
    files: ['**/*.json'],
    language: 'json',
    plugins: {
      json,
    },
    extends: ['json/recommended'],
  },
]);
