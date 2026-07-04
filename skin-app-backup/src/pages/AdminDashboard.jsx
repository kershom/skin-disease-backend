import { useState } from 'react';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../firebase/admins';
import StatsCards from '../components/admin/StatsCards';
import PredictionsChart from '../components/admin/PredictionsChart';
import UsersTable from '../components/admin/UsersTable';
import RecentPredictions from '../components/admin/RecentPredictions';
import { Stethoscope, Shield, BarChart3, Users, Microscope, LineChart, ArrowLeft, LogOut, Menu, Moon, Sun } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const navigate = useNavigate();
  const user = auth.currentUser;

  // ✅ Extra safety — redirect if non-admin somehow gets here
  if (!user || !isAdmin(user.email)) {
    navigate('/unauthorized');
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard',   icon: BarChart3, label: 'Dashboard'   },
    { id: 'users',       icon: Users,     label: 'Users'       },
    { id: 'predictions', icon: Microscope,label: 'Predictions' },
    { id: 'analytics',   icon: LineChart, label: 'Analytics'   },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white dark:bg-slate-800
        border-r border-slate-100 dark:border-slate-700
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-slate-800 dark:text-white">
              Derma<span className="text-blue-600">Lens</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg font-semibold">
            <Shield className="w-3 h-3 text-red-500" /> Admin Panel
          </span>
          {/* ✅ Shows which admin is logged in */}
          <div className="mt-2 text-xs text-slate-400 truncate">{user?.email}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}

          {/* Back to user dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-left w-full mt-2"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span>User Dashboard</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-300 focus:outline-none shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {(() => {
                  const activeItem = navItems.find(n => n.id === activeTab);
                  if (!activeItem) return null;
                  const Icon = activeItem.icon;
                  return <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />;
                })()}
                <span>{navItems.find(n => n.id === activeTab)?.label}</span>
              </h1>
              <p className="text-xs text-slate-400">Admin Control Panel</p>
            </div>
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
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto space-y-6">

          {activeTab === 'dashboard' && (
            <>
              <StatsCards />
              <PredictionsChart />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentPredictions />
                <UsersTable />
              </div>
            </>
          )}

          {activeTab === 'users'       && <UsersTable />}
          {activeTab === 'predictions' && <RecentPredictions />}
          {activeTab === 'analytics'   && <PredictionsChart />}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;