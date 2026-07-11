export const DISEASE_API_KEYS = {
  'Acne': 'acne',
  "Athlete's Foot": 'athleteFoot',
  'Cellulitis': 'cellulitis',
  'Eczema': 'eczema',
  'Impetigo': 'impetigo',
  'Ringworm': 'ringworm',
  'Rosacea': 'rosacea',
  'Shingles': 'shingles',
  'Urticaria (Hives)': 'urticariaHives',
  'Vitiligo': 'vitiligo',
};
 
export const SEVERITY_KEYS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
};
 
// severity values below mirror app.py's SEVERITY_MAP exactly — keep these in
// sync any time the backend severity map changes.
export const diseaseMeta = [
  { key: 'acne', emoji: '🔴', image: '/diseases/acne.jpg', severity: 'low', visualColor: 'from-red-300 to-red-500', visualShape: 'rounded-full' },
  { key: 'athleteFoot', emoji: '🦶', image: '/diseases/athletes-foot.jpg', severity: 'low', visualColor: 'from-yellow-400 to-orange-500', visualShape: 'rounded-lg' },
  { key: 'cellulitis', emoji: '🟥', image: '/diseases/cellulitis.jpg', severity: 'high', visualColor: 'from-red-500 to-rose-700', visualShape: 'rounded-md' },
  { key: 'eczema', emoji: '🟤', image: '/diseases/eczema.jpg', severity: 'low', visualColor: 'from-amber-300 to-orange-400', visualShape: 'rounded-lg' },
  { key: 'impetigo', emoji: '🟧', image: '/diseases/impetigo.jpg', severity: 'medium', visualColor: 'from-amber-400 to-orange-600', visualShape: 'rounded-[60%_40%_60%_40%]' },
  { key: 'ringworm', emoji: '⭕', image: '/diseases/ringworm.jpg', severity: 'low', visualColor: 'from-red-400 to-red-600', visualShape: 'rounded-full' },
  { key: 'rosacea', emoji: '🌹', image: '/diseases/rosacea.jpg', severity: 'low', visualColor: 'from-pink-400 to-rose-500', visualShape: 'rounded-[50%_30%_50%_30%]' },
  { key: 'shingles', emoji: '🟥', image: '/diseases/shingles.jpg', severity: 'high', visualColor: 'from-rose-500 to-red-700', visualShape: 'rounded-md' },
  { key: 'urticariaHives', emoji: '🟨', image: '/diseases/urticaria-hives.jpg', severity: 'medium', visualColor: 'from-pink-300 to-red-400', visualShape: 'rounded-[40%_60%_40%_60%]' },
  { key: 'vitiligo', emoji: '⬜', image: '/diseases/vitiligo.jpg', severity: 'low', visualColor: 'from-slate-100 to-slate-300', visualShape: 'rounded-[40%_60%_70%_30%]' },
];
