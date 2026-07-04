import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Stethoscope, ArrowRight } from 'lucide-react';

const AwarenessBanner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section id="awareness" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 flex gap-4 items-start mb-12">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
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
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t('awareness.ctaTitle')}</h2>
          <p className="text-blue-100 dark:text-blue-200 mb-8 max-w-md mx-auto">
            {t('awareness.ctaSubtitle')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all shadow-lg"
          >
            <span>{t('awareness.ctaButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default AwarenessBanner;
