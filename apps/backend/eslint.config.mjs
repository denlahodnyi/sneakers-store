import path from 'node:path';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import js from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';
import stylisticMigrate from '@stylistic/eslint-plugin-migrate';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJs from '@stylistic/eslint-plugin-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migrate built-in rules to @stylistic/js namespace
/* eslint @stylistic/migrate/migrate-js: "error" */

// Migrate `@typescript-eslint` rules to @stylistic/ts namespace
/* eslint @stylistic/migrate/migrate-ts: "error" */

export default tseslint.config(
  {
    ignores: ['dist/*'],
    plugins: {
      '@stylistic/js': stylisticJs,
      '@stylistic/ts': stylisticTs,
      '@stylistic/migrate': stylisticMigrate,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx,mtsx}'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowEmpty: true,
        },
      ],
    },
  },
  {
    ...eslintPluginImportX.flatConfigs.recommended,
    ignores: ['eslint.config.mjs'],
  },
  {
    ...eslintPluginImportX.flatConfigs.typescript,
    ignores: ['eslint.config.mjs'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ignores: ['eslint.config.mjs'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-duplicates': 'warn',
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          distinctGroup: false,
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    rules: {
      '@stylistic/js/padding-line-between-statements': [
        'error',
        // blank after import
        { blankLine: 'always', prev: 'import', next: '*' },
        // ...allow between (prevents conflict with import-x)
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
    },
  },
  // Must be last
  eslintPluginPrettierRecommended,
);
