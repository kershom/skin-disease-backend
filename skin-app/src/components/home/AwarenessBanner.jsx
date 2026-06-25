import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AwarenessBanner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section id="awareness" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 flex gap-4 items-start mb-12">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
              {t('awareness.disclaimerTitle')}
            </h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
              {t('awareness.disclaimerBody')}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-800 dark:to-cyan-700 rounded-3xl p-10 text-center text-white transition-colors duration-300">
          <div className="text-5xl mb-4">🩺</div>
          <h2 className="text-3xl font-bold mb-3">{t('awareness.ctaTitle')}</h2>
          <p className="text-blue-100 dark:text-blue-200 mb-8 max-w-md mx-auto">
            {t('awareness.ctaSubtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all shadow-lg"
          >
            🚀 {t('awareness.ctaButton')}
          </button>
        </div>

      </div>
    </section>
  );
};

export default AwarenessBanner;
