// Maps API / mock English disease names to i18n keys under dashboard.diseases.*
export const DISEASE_API_KEYS = {
  'Melanocytic Nevi': 'melanocyticNevi',
  'Melanoma': 'melanoma',
  'Basal Cell Carcinoma': 'basalCell',
  'Benign Keratosis': 'benignKeratosis',
  'Dermatofibroma': 'dermatofibroma',
  'Vascular Lesion': 'vascularLesion',
  'Actinic Keratosis': 'actinicKeratosis',
};

export const SEVERITY_KEYS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
};

export const diseaseMeta = [
  { key: 'melanocyticNevi', emoji: '🟤', image: '/diseases/melanocytic-nevi.jpg', severity: 'low', visualColor: 'from-amber-700 to-amber-900', visualShape: 'rounded-full' },
  { key: 'melanoma', emoji: '🔴', image: '/diseases/melanoma.jpg', severity: 'high', visualColor: 'from-red-800 to-slate-900', visualShape: 'rounded-[40%_60%_70%_30%]' },
  { key: 'basalCell', emoji: '🟠', image: '/diseases/basal-cell-carcinoma.jpg', severity: 'medium', visualColor: 'from-pink-300 to-rose-400', visualShape: 'rounded-[60%_40%_60%_40%]' },
  { key: 'benignKeratosis', emoji: '🟡', image: '/diseases/benign-keratosis.jpg', severity: 'low', visualColor: 'from-yellow-600 to-amber-800', visualShape: 'rounded-lg' },
  { key: 'dermatofibroma', emoji: '🟣', image: '/diseases/dermatofibroma.jpg', severity: 'low', visualColor: 'from-purple-600 to-purple-900', visualShape: 'rounded-full' },
  { key: 'vascularLesion', emoji: '🔵', image: '/diseases/vascular-lesion.jpg', severity: 'medium', visualColor: 'from-red-400 to-red-700', visualShape: 'rounded-[50%_30%_50%_30%]' },
  { key: 'actinicKeratosis', emoji: '🟥', image: '/diseases/actinic-keratosis.jpg', severity: 'medium', visualColor: 'from-orange-400 to-red-500', visualShape: 'rounded-md' },
];
