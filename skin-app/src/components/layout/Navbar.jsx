import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') setDarkMode(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-2xl">🩺</span>
          <span className="text-xl font-bold text-slate-800 dark:text-white">
            Derma<span className="text-blue-600">Lens</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t('nav.features')}
          </a>
          <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t('nav.howItWorks')}
          </a>
          <a href="#awareness" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t('nav.awareness')}
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title={darkMode ? t('nav.switchToLight') : t('nav.switchToDark')}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all"
          >
            {t('nav.login')}
          </button>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-600 dark:text-slate-300 text-2xl"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-4 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-slate-600 dark:text-slate-300">{t('nav.features')}</a>
          <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-300">{t('nav.howItWorks')}</a>
          <a href="#awareness" className="text-sm text-slate-600 dark:text-slate-300">{t('nav.awareness')}</a>

          <LanguageSelector fullWidth />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            {darkMode ? `☀️ ${t('nav.switchToLight')}` : `🌙 ${t('nav.switchToDark')}`}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl text-sm"
          >
            {t('nav.login')}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
