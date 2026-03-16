// eslint.config.js
// Flat ESLint config (ESLint v9+)
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Promise: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      // Warn on unused variables (helps catch typos).
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Warn on console.log so developers clean them up before merging.
      'no-console': 'warn',
      // Prefer === over == for comparisons.
      eqeqeq: ['error', 'always'],
      // Disallow var — use const or let.
      'no-var': 'error',
      // Prefer const when the variable is never reassigned.
      'prefer-const': 'warn',
    },
    ignores: [
      'node_modules/**',
      'reports/**',
      'test-results/**',
      'backstop_data/bitmaps_test/**',
      'backstop_data/html_report/**',
    ],
  },
  // Engine scripts run in a Puppeteer/Playwright hybrid context.
  // console.log is the standard output mechanism there, so allow it.
  {
    files: ['backstop_data/engine_scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
