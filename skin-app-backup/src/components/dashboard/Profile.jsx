import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../firebase/firebase';
import { updateProfile } from 'firebase/auth';
import { query, collection, where, orderBy, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { DISEASE_API_KEYS, SEVERITY_KEYS } from '../../i18n/diseaseKeys';
import { User, Save, History, Loader2, X, ChevronRight, Calendar, Activity, CheckCircle2, AlertTriangle, AlertOctagon, BarChart3, Camera, Upload, Microscope } from 'lucide-react';

const severityColor = {
  Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const severityBadge = {
  Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const severityIcon = {
  Low: CheckCircle2,
  Medium: AlertTriangle,
  High: AlertOctagon,
};

const severityChip = {
  Low: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const Profile = () => {
  const { t } = useTranslation();
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

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
            time: data.createdAt?.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || '',
            disease: data.disease,
            confidence: data.confidence,
            severity: data.severity,
            isConsensus: data.isConsensus || false,
            probabilities: data.probabilities || [],
            source: data.source || 'upload',
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

  const translateDisease = (name) => {
    const key = DISEASE_API_KEYS[name];
    return key ? t(`dashboard.diseases.${key}.name`) : name;
  };

  return (
    <div className="space-y-4">

      {/* Profile Card */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('dashboard.profile.title')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 p-[3px] shadow-sm shrink-0">
            <div className="w-full h-full rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-300">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
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
              {loading ? t('dashboard.profile.saving') : (
                <><Save className="w-4 h-4 mr-2" />{t('dashboard.profile.save')}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Card */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex-1">
            {t('dashboard.profile.historyTitle')}
          </h2>
          {history.length > 0 && (
            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg">
              {history.length} scans
            </span>
          )}
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
              <Microscope className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm">
              {t('dashboard.profile.noHistory', 'No scan history found. Run your first skin analysis on the Scan & Predict tab!')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const SeverityIcon = severityIcon[item.severity] || Activity;
              return (
              <div
                key={item.id}
                onClick={() => setSelectedPrediction(item)}
                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 hover:shadow-md transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${severityChip[item.severity]} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <SeverityIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                      {translateDisease(item.disease)}
                    </p>
                    {item.isConsensus && (
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold border border-indigo-100 dark:border-indigo-900/40">
                        Consensus
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <p className="text-[11px] text-slate-400">{item.date} {item.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {item.confidence}%
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${severityBadge[item.severity]}`}>
                    {t(`dashboard.severity.${SEVERITY_KEYS[item.severity]}`)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prediction Detail Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPrediction(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  {translateDisease(selectedPrediction.disease)}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <p className="text-xs text-slate-400">{selectedPrediction.date} at {selectedPrediction.time}</p>
                  {selectedPrediction.isConsensus && (
                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold border border-indigo-100 dark:border-indigo-900/40">
                      Consensus
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">Condition</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{translateDisease(selectedPrediction.disease)}</div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Confidence</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{selectedPrediction.confidence}%</div>
                  <div className="w-full bg-purple-100 dark:bg-purple-900/40 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${selectedPrediction.confidence}%` }} />
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div className={`rounded-xl p-4 border ${severityColor[selectedPrediction.severity]}`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <div className="text-xs font-semibold opacity-70">Severity Level</div>
                </div>
                <div className="flex items-center gap-1.5 text-base font-bold mt-1">
                  {(() => {
                    const ModalSeverityIcon = severityIcon[selectedPrediction.severity] || Activity;
                    return <ModalSeverityIcon className="w-4 h-4" />;
                  })()}
                  {selectedPrediction.severity} Risk
                </div>
              </div>

              {/* Probabilities */}
              {selectedPrediction.probabilities.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                    Prediction Probabilities
                  </h4>
                  <div className="space-y-2.5">
                    {selectedPrediction.probabilities.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>{translateDisease(item.name)}</span>
                          <span className="font-semibold">{item.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-500'}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source info */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span>Source:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 capitalize">
                  {selectedPrediction.source === 'webcam' ? (
                    <><Camera className="w-3.5 h-3.5" /> Webcam</>
                  ) : (
                    <><Upload className="w-3.5 h-3.5" /> Upload</>
                  )}
                </span>
                {selectedPrediction.isConsensus && (
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">· Multi-image consensus</span>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;