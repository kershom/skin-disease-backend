import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES, applyDocumentLanguage } from './languages';

import { localeModules } from './locales';

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

const resources = {};
LANGUAGE_CODES.forEach((code) => {
  resources[code] = {
    translation: localeModules[code] || localeModules.en,
  };
});

const savedLng = localStorage.getItem('i18nextLng');
const defaultLng = LANGUAGE_CODES.includes(savedLng) ? savedLng : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLng,
  fallbackLng: 'en',
  supportedLngs: LANGUAGE_CODES,
  interpolation: { escapeValue: false },
});

applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  applyDocumentLanguage(lng);
});

export default i18n;
