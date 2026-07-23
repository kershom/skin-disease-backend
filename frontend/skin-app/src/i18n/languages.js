// All 21 languages — code is the i18next language key
export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'languages.en', rtl: false, group: 'indian' },
  { code: 'hi', labelKey: 'languages.hi', rtl: false, group: 'indian' },
  { code: 'ml', labelKey: 'languages.ml', rtl: false, group: 'indian' },
  { code: 'ta', labelKey: 'languages.ta', rtl: false, group: 'indian' },
  { code: 'te', labelKey: 'languages.te', rtl: false, group: 'indian' },
  { code: 'kn', labelKey: 'languages.kn', rtl: false, group: 'indian' },
  { code: 'bn', labelKey: 'languages.bn', rtl: false, group: 'indian' },
  { code: 'mr', labelKey: 'languages.mr', rtl: false, group: 'indian' },
  { code: 'gu', labelKey: 'languages.gu', rtl: false, group: 'indian' },
  { code: 'pa', labelKey: 'languages.pa', rtl: false, group: 'indian' },
  { code: 'or', labelKey: 'languages.or', rtl: false, group: 'indian' },
  { code: 'ur', labelKey: 'languages.ur', rtl: true, group: 'indian' },
  { code: 'fr', labelKey: 'languages.fr', rtl: false, group: 'international' },
  { code: 'es', labelKey: 'languages.es', rtl: false, group: 'international' },
  { code: 'ar', labelKey: 'languages.ar', rtl: true, group: 'international' },
  { code: 'zh', labelKey: 'languages.zh', rtl: false, group: 'international' },
  { code: 'ja', labelKey: 'languages.ja', rtl: false, group: 'international' },
  { code: 'ko', labelKey: 'languages.ko', rtl: false, group: 'international' },
  { code: 'ru', labelKey: 'languages.ru', rtl: false, group: 'international' },
  { code: 'de', labelKey: 'languages.de', rtl: false, group: 'international' },
  { code: 'pt', labelKey: 'languages.pt', rtl: false, group: 'international' },
];

export const RTL_LANGUAGES = SUPPORTED_LANGUAGES.filter((l) => l.rtl).map((l) => l.code);

export const applyDocumentLanguage = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
};
