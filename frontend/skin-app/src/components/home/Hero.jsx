import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Rocket,
  Camera,
  ShieldCheck,
  Target,
  Zap,
  ImageIcon,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';

// Images live in /public/diseases/, served from the root path.
const SCANS = [
  { file: 'acne.jpg', name: 'Acne', confidence: 96 },
  { file: 'athletes-foot.jpg', name: "Athlete's foot", confidence: 94 },
  { file: 'cellulitis.jpg', name: 'Cellulitis', confidence: 92 },
  { file: 'eczema.jpg', name: 'Eczema', confidence: 97 },
  { file: 'impetigo.jpg', name: 'Impetigo', confidence: 93 },
  { file: 'ringworm.jpg', name: 'Ringworm', confidence: 95 },
  { file: 'rosacea.jpg', name: 'Rosacea', confidence: 91 },
  { file: 'shingles.jpg', name: 'Shingles', confidence: 94 },
  { file: 'urticaria-hives.jpg', name: 'Urticaria (hives)', confidence: 90 },
  { file: 'vitiligo.jpg', name: 'Vitiligo', confidence: 96 },
];

const ROTATE_MS = 4000;
const FADE_MS = 300;
const RING_RADIUS = 30;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/15',
    border: 'border-blue-200 dark:border-blue-400/30',
    text: 'text-blue-600 dark:text-blue-300',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/15',
    border: 'border-cyan-200 dark:border-cyan-400/30',
    text: 'text-cyan-600 dark:text-cyan-300',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-500/15',
    border: 'border-purple-200 dark:border-purple-400/30',
    text: 'text-purple-600 dark:text-purple-300',
    dot: 'bg-purple-500 dark:bg-purple-400',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    border: 'border-emerald-200 dark:border-emerald-400/30',
    text: 'text-emerald-600 dark:text-emerald-300',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
};

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % SCANS.length);
        setVisible(true);
      }, FADE_MS);
      return () => clearTimeout(swap);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  const scan = SCANS[index];
  const ringOffset = RING_CIRC * (1 - scan.confidence / 100);

  const steps = [
    {
      icon: ImageIcon,
      color: 'blue',
      title: t('hero.pipeline.capture.title', 'Image capture'),
      desc: t('hero.pipeline.capture.desc', 'Skin image captured successfully'),
    },
    {
      icon: BrainCircuit,
      color: 'cyan',
      title: t('hero.pipeline.analysis.title', 'AI analysis'),
      desc: t('hero.pipeline.analysis.desc', 'Our deep learning model is analyzing your image'),
    },
    {
      icon: null,
      color: 'purple',
      title: t('hero.pipeline.gradcam.title', 'Grad-CAM'),
      desc: t('hero.pipeline.gradcam.desc', 'Highlighting affected areas for better interpretation'),
    },
    {
      icon: ShieldCheck,
      color: 'green',
      title: t('hero.pipeline.prediction.title', 'Prediction'),
      desc: null,
      highlight: true,
    },
  ];

  const stats = [
    { icon: ShieldCheck, value: '7+', label: t('hero.statDiseases') },
    { icon: Target, value: '95%', label: t('hero.statAccuracy') },
    { icon: Zap, value: '<2s', label: t('hero.statInstant') },
  ];

  return (
    <section className="relative min-h-screen bg-white dark:bg-[#060912] overflow-hidden flex items-center pt-20 transition-colors duration-300">
      <style>{`
        @keyframes scanSweep {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        .scan-line { animation: scanSweep 2.4s ease-in-out infinite; }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ripple { animation: ripple 2.8s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scan-line, .ripple { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-blue-400/5 dark:bg-blue-600/10 blur-[120px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 items-center">

        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-400/20 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> {t('hero.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
            {t('hero.titleLine1')} <br />
            <span className="text-blue-600 dark:text-blue-400">{t('hero.titleLine2')}</span> <br />
            {t('hero.titleLine3')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 border-2 border-blue-600 dark:border-blue-400/30 text-white dark:text-blue-300 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Rocket className="w-4 h-4" />
              <span>{t('hero.getStarted')}</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 border-2 border-cyan-500 dark:border-cyan-400/30 text-white dark:text-cyan-300 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-200 dark:shadow-none"
            >
              <Camera className="w-4 h-4" />
              <span>{t('hero.scanNow')}</span>
            </button>
          </div>

          <div className="flex gap-6 mt-10 justify-center lg:justify-start">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center lg:items-start gap-1.5">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center py-10">
          <div className="relative w-[220px] h-[440px] rounded-[36px] border-4 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl dark:shadow-blue-950/50">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 dark:bg-slate-950 rounded-full"></div>

            <div className="absolute inset-3 top-8 bottom-8 flex flex-col items-center">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{t('hero.pipeline.scanning', 'Scanning...')}</p>

              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  key={scan.file}
                  src={`/diseases/${scan.file}`}
                  alt={`Sample skin scan: ${scan.name}`}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="scan-line absolute left-0 right-0 h-0.5 bg-cyan-500 dark:bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.5)]"></div>
                {['top-1 left-1 border-t-2 border-l-2', 'top-1 right-1 border-t-2 border-r-2', 'bottom-1 left-1 border-b-2 border-l-2', 'bottom-1 right-1 border-b-2 border-r-2'].map((pos) => (
                  <div key={pos} className={`absolute w-4 h-4 border-cyan-500 dark:border-cyan-300 ${pos}`}></div>
                ))}
              </div>

              <div className="relative mt-4 w-20 h-20">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle cx="36" cy="36" r={RING_RADIUS} fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="5" />
                  <circle
                    cx="36" cy="36" r={RING_RADIUS} fill="none" stroke="#3b82f6" strokeWidth="5"
                    strokeDasharray={RING_CIRC} strokeDashoffset={ringOffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-slate-800 dark:text-white text-sm font-semibold">
                  {scan.confidence}%
                </div>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">{t('hero.pipeline.analyzing', 'Analyzing image...')}</p>
            </div>
          </div>

          <div className="absolute -bottom-4 w-52 h-16">
            <div className="ripple absolute inset-0 rounded-full border border-blue-400/40 dark:border-blue-500/40"></div>
            <div className="ripple absolute inset-0 rounded-full border border-blue-400/40 dark:border-blue-500/40" style={{ animationDelay: '0.9s' }}></div>
            <div className="ripple absolute inset-0 rounded-full border border-blue-400/40 dark:border-blue-500/40" style={{ animationDelay: '1.8s' }}></div>
          </div>
        </div>

        <div className="relative pl-5">
          <div className="absolute left-[7px] top-4 bottom-16 border-l border-dashed border-slate-200 dark:border-slate-700"></div>

          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const c = colorMap[step.color] || colorMap.blue;
              return (
                <div key={step.title} className="relative flex gap-3">
                  <div className={`absolute -left-5 top-4 w-3 h-3 rounded-full ${c.dot} ring-4 ring-white dark:ring-[#060912]`}></div>

                  <div className={`flex-1 rounded-xl border ${c.border} ${c.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${step.icon ? c.bg : ''} border ${c.border}`}>
                        {step.icon ? (
                          <step.icon className={`w-4 h-4 ${c.text}`} />
                        ) : (
                          <div className="w-5 h-5 rounded-full" style={{ background: 'conic-gradient(from 180deg, #3b82f6, #10b981, #eab308, #ef4444, #3b82f6)' }}></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full ${c.dot} text-[10px] flex items-center justify-center text-white font-bold`}>{i + 1}</span>
                          {step.title}
                        </p>
                        {step.highlight ? (
                          <>
                            <p className={`text-sm font-medium mt-1 transition-opacity duration-300 ${c.text} ${visible ? 'opacity-100' : 'opacity-0'}`}>
                              {scan.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                              {t('hero.pipeline.confidence', 'Confidence')}: {scan.confidence}%
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium px-3 py-2 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('hero.pipeline.complete', 'AI analysis complete')}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
