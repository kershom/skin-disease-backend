import { useTranslation } from 'react-i18next';
import { DISEASE_API_KEYS, SEVERITY_KEYS } from '../../i18n/diseaseKeys';

const severityColor = {
  Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const PredictionResult = ({ data, image }) => {
  const { t } = useTranslation();

  const translateDisease = (name) => {
    const key = DISEASE_API_KEYS[name];
    if (key) return t(`dashboard.diseases.${key}.name`);
    if (name === 'Others') return t('dashboard.prediction.others');
    return name;
  };

  const sevKey = SEVERITY_KEYS[data.severity];
  const severityLabel = t(`dashboard.severity.${sevKey}`);
  const severityHint =
    data.severity === 'Low'
      ? t('dashboard.severity.benign')
      : data.severity === 'Medium'
      ? t('dashboard.severity.monitor')
      : t('dashboard.severity.urgent');

  return (
    <div className="space-y-4">

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🎯</span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('dashboard.prediction.title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">{t('dashboard.prediction.condition')}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{translateDisease(data.disease)}</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">{t('dashboard.prediction.confidence')}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{data.confidence}%</div>
            <div className="w-full bg-purple-100 dark:bg-purple-900/40 rounded-full h-1.5 mt-2">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${severityColor[data.severity]}`}>
            <div className="text-xs font-semibold mb-1 opacity-70">{t('dashboard.prediction.severity')}</div>
            <div className="text-lg font-bold">{t('dashboard.severity.risk', { level: severityLabel })}</div>
            <div className="text-xs mt-1 opacity-70">
              {data.severity === 'Low' && '✅ '}
              {data.severity === 'Medium' && '⚠️ '}
              {data.severity === 'High' && '🚨 '}
              {severityHint}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            📊 {t('dashboard.prediction.probabilities')}
          </h3>
          <div className="space-y-3">
            {data.probabilities.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>{translateDisease(item.name)}</span>
                  <span className="font-medium">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      index === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🗺️</span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('dashboard.prediction.gradcamTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">{t('dashboard.prediction.original')}</p>
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
              <img src={image} alt="Original" className="w-full object-contain max-h-48" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">{t('dashboard.prediction.heatmap')}</p>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-700 max-h-48 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-4xl mb-2">🔗</div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('dashboard.prediction.heatmapPending')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex gap-3">
        <span className="text-xl">⚠️</span>
        <p className="text-amber-700 dark:text-amber-400 text-sm">
          {t('dashboard.prediction.disclaimer')}
        </p>
      </div>

    </div>
  );
};

export default PredictionResult;
