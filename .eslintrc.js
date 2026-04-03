module.exports = {
  extends: 'universe/native',
  root: true,
  rules: {
    'import/order': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['*.js', 'scripts/*.mjs'],
      env: {
        node: true,
      },
    },
  ],
};
