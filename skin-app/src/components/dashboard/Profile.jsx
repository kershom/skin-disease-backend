import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { query, collection, where, orderBy, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { DISEASE_API_KEYS, SEVERITY_KEYS } from '../../i18n/diseaseKeys';
import { User, Save, History, Loader2 } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'predictions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.createdAt?.toDate().toLocaleDateString('en-IN') || 'N/A',
            disease: data.disease,
            confidence: data.confidence + '%',
            severity: data.severity,
            isConsensus: data.isConsensus || false
          };
        });
        setHistory(list);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

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
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>{t('dashboard.profile.title')}</span>
        </h2>

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
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60"
            >
              {loading ? (
                t('dashboard.profile.saving')
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('dashboard.profile.save')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>{t('dashboard.profile.historyTitle')}</span>
        </h2>
        
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">
              {t('dashboard.profile.noHistory', 'No scan history found. Run your first skin analysis on the Scan & Predict tab!')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl"
              >
                <div>
                  <div className="flex items-center">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {translateDisease(item.disease)}
                    </p>
                    {item.isConsensus && (
                      <span className="ml-2 inline-flex items-center text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold border border-indigo-100 dark:border-indigo-900/40">
                        Consensus
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {item.confidence}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${severityBadge[item.severity]}`}>
                    {t(`dashboard.severity.${SEVERITY_KEYS[item.severity]}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;

