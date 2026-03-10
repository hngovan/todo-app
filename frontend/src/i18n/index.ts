import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// Import locale files directly
import enAuth from '@/locales/en/auth.json'
import enCommon from '@/locales/en/common.json'
import enProfile from '@/locales/en/profile.json'
import jaAuth from '@/locales/ja/auth.json'
import jaCommon from '@/locales/ja/common.json'
import jaProfile from '@/locales/ja/profile.json'
import viAuth from '@/locales/vi/auth.json'
import viCommon from '@/locales/vi/common.json'
import viProfile from '@/locales/vi/profile.json'

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages'

// Define resources type
type Resources = Record<
  string,
  {
    common: typeof enCommon
    auth: typeof enAuth
    profile: typeof enProfile
  }
>

const resources: Resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    profile: enProfile
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    profile: jaProfile
  },
  vi: {
    common: viCommon,
    auth: viAuth,
    profile: viProfile
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'auth'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    interpolation: {
      escapeValue: false // not needed for react!!
    }
  })

export default i18n
