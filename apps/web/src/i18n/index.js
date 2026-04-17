import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import tr from './tr.json'
import en from './en.json'
import ar from './ar.json'

const RTL_LANGS = new Set(['ar'])

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    ar: { translation: ar }
  },
  lng: localStorage.getItem('fener.lang') || 'tr',
  fallbackLng: 'tr',
  interpolation: { escapeValue: false }
})

function applyDir(lng) {
  const dir = RTL_LANGS.has(lng) ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
}
applyDir(i18n.language)
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('fener.lang', lng)
  applyDir(lng)
})

export default i18n
