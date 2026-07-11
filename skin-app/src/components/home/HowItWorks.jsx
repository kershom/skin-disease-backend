import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Upload, Brain, ClipboardList } from 'lucide-react';

const stepConfig = [
  {
    step: '01',
    icon: Upload,
    key: 'step1',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-600 dark:bg-blue-700',
    glow: 'bg-blue-500',
    shadow: 'shadow-blue-200 dark:shadow-blue-950/60',
    lineFrom: '#2563eb',
    lineTo: '#0891b2',
  },
  {
    step: '02',
    icon: Brain,
    key: 'step2',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-600 dark:bg-cyan-700',
    glow: 'bg-cyan-500',
    shadow: 'shadow-cyan-200 dark:shadow-cyan-950/60',
    lineFrom: '#0891b2',
    lineTo: '#9333ea',
  },
  {
    step: '03',
    icon: ClipboardList,
    key: 'step3',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-600 dark:bg-purple-700',
    glow: 'bg-purple-500',
    shadow: 'shadow-purple-200 dark:shadow-purple-950/60',
  },
];

const HowItWorks = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" /> {t('howItWorks.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">
            {t('howItWorks.title')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {stepConfig.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="group relative text-center">

                {index < stepConfig.length - 1 && (
                  <>
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
                    <div
                      className="hidden md:block absolute top-10 left-1/2 h-0.5 z-0 transition-all duration-1000 ease-out"
                      style={{
                        width: inView ? '100%' : '0%',
                        background: `linear-gradient(to right, ${item.lineFrom}, ${item.lineTo})`,
                      }}
                    ></div>
                  </>
                )}

                <div className="relative z-10 w-20 h-20 mx-auto mb-6">
                  <div className={`absolute inset-0 rounded-full ${item.glow} opacity-20 dark:opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-40 dark:group-hover:opacity-50`}></div>
                  <div className={`relative w-20 h-20 ${item.bg} rounded-full flex items-center justify-center shadow-lg ${item.shadow} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className={`text-xs font-bold ${item.color} mb-2`}>
                  {t('howItWorks.stepLabel')} {item.step}
                </div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t(`howItWorks.${item.key}.title`)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {t(`howItWorks.${item.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
