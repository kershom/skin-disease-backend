import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../../firebase/firebase';
import { updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';
import { DISEASE_API_KEYS, SEVERITY_KEYS } from '../../i18n/diseaseKeys';

const Profile = () => {
  const { t } = useTranslation();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      toast.success(t('dashboard.profile.updateSuccess'));
    } catch (err) {
      toast.error(t('dashboard.profile.updateError'));
    }
    setLoading(false);
  };

  const history = [
    { date: '2025-05-20', disease: 'Melanocytic Nevi', confidence: '87.4%', severity: 'Low' },
    { date: '2025-05-15', disease: 'Benign Keratosis', confidence: '91.2%', severity: 'Low' },
    { date: '2025-05-10', disease: 'Dermatofibroma', confidence: '78.9%', severity: 'Low' },
  ];

  const severityBadge = {
    Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  const translateDisease = (name) => {
    const key = DISEASE_API_KEYS[name];
    return key ? t(`dashboard.diseases.${key}.name`) : name;
  };

  return (
    <div className="space-y-4">

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">👤 {t('dashboard.profile.title')}</h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-300 shrink-0">
            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('dashboard.profile.displayName')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('dashboard.profile.email')}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {loading ? t('dashboard.profile.saving') : `💾 ${t('dashboard.profile.save')}`}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          🕐 {t('dashboard.profile.historyTitle')}
        </h2>
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white text-sm">{translateDisease(item.disease)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {item.confidence}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${severityBadge[item.severity]}`}>
                  {t(`dashboard.severity.${SEVERITY_KEYS[item.severity]}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
          {t('dashboard.profile.historyNote')}
        </p>
      </div>

    </div>
  );
};

export default Profile;
