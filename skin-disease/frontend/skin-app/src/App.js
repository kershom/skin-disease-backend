import { useNavigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { auth } from './firebase/firebase';
import i18n from './i18n';
import { onAuthStateChanged } from 'firebase/auth';
import { Activity, ShieldBan } from 'lucide-react';
import { isAdmin } from './firebase/admins';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatBot from './components/chatbot/ChatBot';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mb-4 flex justify-center text-slate-600 dark:text-slate-300">
            <Activity size={44} className="animate-pulse" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            {i18n.t('app.loading')}
          </div>
        </div>
      </div>
    );
  }

  return (
  <BrowserRouter>
    <Toaster position="top-right" />

    <ChatBot />

    <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* User dashboard — any logged in user */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Admin dashboard — only admin emails */}
        <Route
          path="/admin"
          element={
            !user
              ? <Navigate to="/login" />
              : isAdmin(user.email)
              ? <AdminDashboard />
              : <Navigate to="/unauthorized" />
          }
        />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Unauthorized page — shown to non-admins trying to access /admin
const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-700">
        <div className="mb-4 flex justify-center text-rose-500">
          <ShieldBan size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          You don't have permission to access the Admin Dashboard.
          This area is restricted to authorized administrators only.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Go to My Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
