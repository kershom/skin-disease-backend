import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center pt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">

        <div className="flex-1 text-center md:text-left">
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            🤖 {t('hero.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white leading-tight mb-4">
            {t('hero.titleLine1')} <br />
            <span className="text-blue-600 dark:text-blue-400">{t('hero.titleLine2')}</span> <br />
            {t('hero.titleLine3')}
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-lg mb-8 max-w-md">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900"
            >
              🚀 {t('hero.getStarted')}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              📷 {t('hero.scanNow')}
            </button>
          </div>

          <div className="flex gap-8 mt-10 justify-center md:justify-start">
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">7+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('hero.statDiseases')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">95%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('hero.statAccuracy')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{t('hero.statInstantValue')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('hero.statInstant')}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900 dark:to-cyan-900 animate-pulse opacity-50"></div>
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-300 to-cyan-300 dark:from-blue-800 dark:to-cyan-800 opacity-40"></div>
            <div className="absolute inset-12 rounded-full bg-white dark:bg-slate-700 shadow-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🔬</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">{t('hero.aiAnalysis')}</div>
              </div>
            </div>
            <div className="absolute top-4 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900 px-3 py-2 text-xs font-medium text-green-600 dark:text-green-400">
              ✅ {t('hero.badgeAccurate')}
            </div>
            <div className="absolute bottom-8 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400">
              ⚡ {t('hero.badgeResults')}
            </div>
            <div className="absolute bottom-0 right-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900 px-3 py-2 text-xs font-medium text-purple-600 dark:text-purple-400">
              🔒 {t('hero.badgeSecure')}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
