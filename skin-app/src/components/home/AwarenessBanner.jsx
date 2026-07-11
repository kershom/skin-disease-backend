import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const AwarenessBanner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section id="awareness" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-amber-50/60 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-6 flex gap-4 items-start mb-12">
          <div className="w-11 h-11 rounded-xl bg-amber-100/60 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
              {t('awareness.disclaimerTitle')}
            </h3>
            <p className="text-amber-700/90 dark:text-amber-300/90 text-sm leading-relaxed">
              {t('awareness.disclaimerBody')}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 dark:from-blue-800 dark:to-cyan-700 rounded-3xl p-10 text-center text-white transition-colors duration-300">

          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          ></div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-3">{t('awareness.ctaTitle')}</h2>
            <p className="text-blue-100 dark:text-blue-200 mb-8 max-w-md mx-auto">
              {t('awareness.ctaSubtitle')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-lg"
            >
              <span>{t('awareness.ctaButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AwarenessBanner;
