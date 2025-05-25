// contracheque-app/apps/api/eslint.config.js
import pluginJs from '@eslint/js';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // Para integrar Prettier
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } }, // Adicione ...globals.vitest se usar Vitest
  pluginJs.configs.recommended, // Configurações recomendadas do ESLint base
  ...tseslint.configs.recommendedTypeChecked, // Configurações recomendadas do TypeScript-ESLint com checagem de tipo
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'], // Caminho para seu tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Ajuda o ESLint a encontrar o tsconfig corretamente
      },
    },
  },
  pluginPrettierRecommended, // Deve ser o último para sobrescrever outras regras de formatação
  {
    rules: {
      // Suas regras customizadas aqui.
      // Exemplos (ajuste conforme o .eslintrc.json anterior):
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'prettier/prettier': 'error', // Já vem com pluginPrettierRecommended, mas bom reforçar
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
    ], // Arquivos e pastas a serem ignorados
  },
];
