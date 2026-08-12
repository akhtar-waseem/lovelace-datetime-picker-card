import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Replaces ignorePatterns (glob patterns require '**')
    ignores: ['dist/**', 'node_modules/**', '*.js'],
  },
  // Replaces "plugin:@typescript-eslint/recommended"
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        experimentalDecorators: true,
      },
    },
    rules: {
      // '@typescript-eslint/camelcase' was deprecated/removed in newer versions.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-namespace': 'off',
    },
  }
);