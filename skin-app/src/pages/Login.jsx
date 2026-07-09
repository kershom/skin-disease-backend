import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const mapAuthError = (code) => {
    const map = {
      'auth/user-not-found': 'login.errors.userNotFound',
      'auth/wrong-password': 'login.errors.wrongPassword',
      'auth/invalid-email': 'login.errors.invalidEmail',
      'auth/email-already-in-use': 'login.errors.emailInUse',
    };
    return map[code] ? t(map[code]) : null;
  };

  const handleLogin = async () => {
    setError('');
    if (!loginData.email || !loginData.password) {
      setError(t('login.errors.fillAll'));
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);

      // ✅ Update lastLogin, and backfill profile fields for pre-existing users missing a doc
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: serverTimestamp(),
      }, { merge: true });

      navigate('/dashboard');
    } catch (err) {
      setError(mapAuthError(err.code) || err.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    setError('');
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError(t('login.errors.fillRequired'));
      return;
    }
    if (signupData.password.length < 6) {
      setError(t('login.errors.passwordMin'));
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError(t('login.errors.passwordMismatch'));
      return;
    }
    if (signupData.phone && !/^\d{10}$/.test(signupData.phone)) {
      setError(t('login.errors.phoneInvalid'));
      return;
    }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      await updateProfile(result.user, { displayName: signupData.fullName });

      // ✅ Create Firestore profile doc for the new user
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: signupData.fullName,
        email: signupData.email,
        phone: signupData.phone || '',
        photoURL: result.user.photoURL || '',
        scans: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      alert(t('login.welcomeAboard')); // updated message — e.g. "Account created! Taking you to your dashboard..."
      navigate('/dashboard');
    } catch (err) {
      setError(mapAuthError(err.code) || err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // ✅ Create/update Firestore profile doc for Google sign-ins too
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        lastLogin: serverTimestamp(),
      }, { merge: true });

      alert(t('login.successGoogle'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const inputClass = "w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">

      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all"
      >
        <span aria-hidden>←</span>
        {t('login.backToHome')}
      </button>

      <button
        type="button"
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm z-50"
        title={darkMode ? t('nav.switchToLight') : t('nav.switchToDark')}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 transition-colors duration-300">

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-center mb-6 group cursor-pointer"
        >
          <div className="text-4xl mb-2 group-hover:scale-105 transition-transform">🩺</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Derma<span className="text-blue-600 dark:text-blue-400">Lens</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('login.tagline')}
          </p>
        </button>

        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              isLogin
                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('login.loginTab')}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              !isLogin
                ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t('login.signupTab')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4 border border-red-100 dark:border-red-800">
            ⚠️ {error}
          </div>
        )}

        {isLogin && (
          <div>
            <div className="mb-4">
              <label className={labelClass}>{t('login.email')}</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>{t('login.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                  autoComplete={savePassword ? 'current-password' : 'off'}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="savePassword"
                checked={savePassword}
                onChange={(e) => setSavePassword(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="savePassword" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                {t('login.savePassword')}
              </label>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all mb-4"
            >
              {loading ? t('login.loggingIn') : t('login.loginButton')}
            </button>
          </div>
        )}

        {!isLogin && (
          <div>
            <div className="mb-4">
              <label className={labelClass}>
                {t('login.fullName')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={signupData.fullName}
                onChange={handleSignupChange}
                placeholder="Hannah Elsa"
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>
                {t('login.phone')} <span className="text-slate-400 text-xs">{t('login.phoneOptional')}</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={signupData.phone}
                onChange={handleSignupChange}
                placeholder={t('login.phonePlaceholder')}
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>
                {t('login.email')} <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder={t('login.emailPlaceholder')}
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>
                {t('login.password')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  placeholder={t('login.passwordMinPlaceholder')}
                  autoComplete="new-password"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className={labelClass}>
                {t('login.confirmPassword')} <span className="text-red-400">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                placeholder={t('login.confirmPlaceholder')}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all mb-4"
            >
              {loading ? t('login.creatingAccount') : t('login.createAccount')}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600"></div>
          <span className="text-slate-400 dark:text-slate-500 text-sm">{t('login.or')}</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600"></div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🌐</span> {t('login.continueGoogle')}
        </button>

      </div>
    </div>
  );
};

export default Login;
