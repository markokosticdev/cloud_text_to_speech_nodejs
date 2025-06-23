import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jest from 'eslint-plugin-jest';
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        ...globals.node,
        // TypeScript global namespace
        NodeJS: 'readonly',
        // DOM globals needed for XML parsing (@xmldom/xmldom)
        DOMParser: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        Text: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-case-declarations': 'off',
      'no-useless-catch': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['tests/**/*.{ts,mts}', '**/*.test.{ts,mts}', '**/*.spec.{ts,mts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        // TypeScript global namespace
        NodeJS: 'readonly',
        // DOM globals needed for XML parsing (@xmldom/xmldom)
        DOMParser: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        Text: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      jest,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...jest.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-case-declarations': 'off',
      'no-useless-catch': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'coverage/**',
      'docs/**',
      'examples/**',
      '**/*.js',
      '**/*.d.ts',
      '*.js',
      '*.mjs',
      '*.cjs',
    ],
  },
]; 