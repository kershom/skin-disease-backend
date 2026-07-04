import { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageUpload from '../components/dashboard/ImageUpload';
import DiseaseInfo from '../components/dashboard/DiseaseInfo';
import Precautions from '../components/dashboard/Precautions';
import Profile from '../components/dashboard/Profile';
import LanguageSelector from '../components/layout/LanguageSelector';
import { isAdmin } from '../firebase/admins';
import {
  Stethoscope,
  ScanLine,
  FileText,
  AlertTriangle,
  User,
  Shield,
  LogOut,
  Menu,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('scan');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { id: 'scan', icon: ScanLine, labelKey: 'dashboard.nav.scan' },
    { id: 'disease', icon: FileText, labelKey: 'dashboard.nav.disease' },
    { id: 'precautions', icon: AlertTriangle, labelKey: 'dashboard.nav.precautions' },
    { id: 'profile', icon: User, labelKey: 'dashboard.nav.profile' },
    ...(isAdmin(user?.email)
      ? [{ id: 'admin', icon: Shield, labelKey: 'dashboard.nav.admin' }]
      : []),
  ];

  const activeNav = navItems.find((n) => n.id === activeTab);
  const firstName = user?.displayName?.split(' ')[0] || t('dashboard.user');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">

      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white dark:bg-slate-800
        border-r border-slate-100 dark:border-slate-700
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              Derma<span className="text-blue-600">Lens</span>
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.displayName || t('dashboard.user')}
              </div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              {isAdmin(user?.email) && (
                <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg font-semibold mt-1">
                  <Shield className="w-3 h-3" /> {t('dashboard.adminBadge')}
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
              {t('dashboard.language')}
            </label>
            <LanguageSelector fullWidth />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>{t('dashboard.logout')}</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">

        <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-300 focus:outline-none shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
                {activeNav && <activeNav.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
                <span>{activeNav ? t(activeNav.labelKey) : ''}</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">
                {t('dashboard.welcomeBack', { name: firstName })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                setIsDarkMode(isDark);
              }}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === 'scan' && (
            <ImageUpload
              images={images}
              setImages={setImages}
              selectedImageId={selectedImageId}
              setSelectedImageId={setSelectedImageId}
            />
          )}
          {activeTab === 'disease' && <DiseaseInfo />}
          {activeTab === 'precautions' && <Precautions />}
          {activeTab === 'profile' && <Profile />}

          {activeTab === 'admin' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {t('dashboard.adminPanel.title')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                {t('dashboard.adminPanel.description')}
              </p>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                <span>{t('dashboard.adminPanel.open')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;
