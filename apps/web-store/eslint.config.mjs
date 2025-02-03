import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
// import * as tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';
import stylistic from '@stylistic/eslint-plugin';

// TODO: add eslint-plugin-boundaries

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  {
    settings: {
      next: {
        rootDir: process.cwd(),
      },
    },
  },
  ...compat.extends('next/core-web-vitals' /* 'next/typescript' */),
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: ['dist/*', '.next/*'],
    plugins: {
      '@stylistic': stylistic,
    },
  },
  {
    files: ['**/*.{ts,tsx,mtsx}'],
    languageOptions: {
      // parser: tsParser,
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
  },
  {
    files: ['**/*.{jsx,tsx,mtsx}'],
    rules: {
      'react/jsx-sort-props': [
        2,
        {
          reservedFirst: ['key', 'ref'],
          multiline: 'last',
          shorthandFirst: true,
          callbacksLast: true,
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
      // parser: tsParser,
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import-x/no-duplicates': 'warn',
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'internal',
              position: 'before',
            },
          ],
          distinctGroup: false,
        },
      ],
    },
  },
  stylistic.configs.customize({
    semi: true,
    quoteProps: 'as-needed',
  }),
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        // blank after import
        { blankLine: 'always', prev: 'import', next: '*' },
        // ...allow between (prevents conflict with import-x)
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/indent': ['off'],
      '@stylistic/indent-binary-ops': ['off'],
      '@stylistic/operator-linebreak': ['off'], // conflicts with Prettier
      '@stylistic/arrow-parens': ['off'], // conflicts with Prettier
      '@stylistic/multiline-ternary': ['off'],
      '@stylistic/jsx-curly-newline': ['off'], // conflicts with Prettier
      '@stylistic/jsx-one-expression-per-line': ['off'], // conflicts with Prettier
      '@stylistic/quotes': [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
    },
  },
  eslintPluginPrettierRecommended,
);
