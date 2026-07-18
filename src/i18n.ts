import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/en-GB.json'
import ms from './locales/ms/ms-MY.json'

const resources = {
  en: { translation: en },
  ms: {
    translation: ms,
  },
}

const stored = localStorage.getItem('lang')
const initialLang = stored === 'en' || stored === 'ms' ? stored : 'ms'

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'ms',
  showSupportNotice: false,
  interpolation: { escapeValue: false },
})

export default i18n
