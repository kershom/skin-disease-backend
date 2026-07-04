export const DISEASE_API_KEYS = {
  'Acne': 'acne',
  'Actinic Keratosis': 'actinicKeratosis',
  'Basal Cell Carcinoma': 'basalCell',
  'Eczema': 'eczema',
  'Psoriasis': 'psoriasis',
  'Ringworm': 'ringworm',
  'Rosacea': 'rosacea',
  'Seborrheic Keratosis': 'seborrheicKeratosis',
  'Vitiligo': 'vitiligo',
  'Warts': 'warts',
};

export const SEVERITY_KEYS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
};

export const diseaseMeta = [
  { key: 'acne', emoji: '🔴', image: '/diseases/acne.jpg', severity: 'low', visualColor: 'from-red-300 to-red-500', visualShape: 'rounded-full' },
  { key: 'actinicKeratosis', emoji: '🟥', image: '/diseases/actinic-keratosis.jpg', severity: 'medium', visualColor: 'from-orange-400 to-red-500', visualShape: 'rounded-md' },
  { key: 'basalCell', emoji: '🟠', image: '/diseases/basal-cell-carcinoma.jpg', severity: 'medium', visualColor: 'from-pink-300 to-rose-400', visualShape: 'rounded-[60%_40%_60%_40%]' },
  { key: 'eczema', emoji: '🟤', image: '/diseases/eczema.jpg', severity: 'low', visualColor: 'from-amber-300 to-orange-400', visualShape: 'rounded-lg' },
  { key: 'psoriasis', emoji: '🔵', image: '/diseases/psoriasis.jpg', severity: 'low', visualColor: 'from-slate-400 to-slate-600', visualShape: 'rounded-md' },
  { key: 'ringworm', emoji: '⭕', image: '/diseases/ringworm.jpg', severity: 'low', visualColor: 'from-red-400 to-red-600', visualShape: 'rounded-full' },
  { key: 'rosacea', emoji: '🌹', image: '/diseases/rosacea.jpg', severity: 'low', visualColor: 'from-pink-400 to-rose-500', visualShape: 'rounded-[50%_30%_50%_30%]' },
  { key: 'seborrheicKeratosis', emoji: '🟡', image: '/diseases/seborrheic-keratosis.jpg', severity: 'low', visualColor: 'from-yellow-600 to-amber-800', visualShape: 'rounded-lg' },
  { key: 'vitiligo', emoji: '⬜', image: '/diseases/vitiligo.jpg', severity: 'low', visualColor: 'from-slate-100 to-slate-300', visualShape: 'rounded-[40%_60%_70%_30%]' },
  { key: 'warts', emoji: '🟫', image: '/diseases/warts.jpg', severity: 'low', visualColor: 'from-stone-400 to-stone-600', visualShape: 'rounded-md' },
];
