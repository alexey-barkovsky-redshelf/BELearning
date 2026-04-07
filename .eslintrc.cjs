module.exports = {
  root: true,
  env: { node: true, es2020: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'build', 'node_modules', '*.cjs'],
  overrides: [
    {
      files: ['apps/api/**/*.test.ts'],
      parserOptions: {
        project: './apps/api/tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['apps/web/vite.config.ts'],
      parserOptions: {
        project: './apps/web/tsconfig.node.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-require-imports': 'off',
  },
};
