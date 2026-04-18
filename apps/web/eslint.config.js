import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'dev-dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        // Vite define() ile enjekte edilen build sabitleri
        __BUILD_SHA__: 'readonly',
        __BUILD_AT__: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // eslint-plugin-react-hooks v6 ile gelen yeni sıkı kuralları uyarıya düşür —
      // mevcut kod tabanında büyük refaktör gerektirir; şimdilik bloke etmesin.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // Boş catch blokları kasıtlı (Wake Lock, silent failure desenleri)
      'no-empty': ['warn', { allowEmptyCatch: true }],
    }
  },
  {
    // Test dosyaları için Node globals
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      'no-empty': 'warn',
    },
  },
]
