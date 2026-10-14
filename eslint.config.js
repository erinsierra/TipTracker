// Lint rules: the standard Expo set. Run with "npm run lint".
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*'] },
  { files: ['tests/**/*.js'], languageOptions: { globals: globals.jest } },
]);
