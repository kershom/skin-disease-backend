import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { BarChart3, Loader2 } from 'lucide-react';

const DISEASE_NAMES_CONFIG = {
  'Acne': { label: 'Acne', color: '#6366f1' },
  'Actinic Keratosis': { label: 'Actinic K.', color: '#ec4899' },
  'Basal Cell Carcinoma': { label: 'Basal Cell', color: '#f97316' },
  'Benign Keratosis': { label: 'Ben. Kerat.', color: '#eab308' },
  'Dermatofibroma': { label: 'Dermato.', color: '#a855f7' },
  'Eczema': { label: 'Eczema', color: '#10b981' },
  'Melanocytic Nevi': { label: 'Mel. Nevi', color: '#4f46e5' },
  'Melanoma': { label: 'Melanoma', color: '#ef4444' },
  'Psoriasis': { label: 'Psoriasis', color: '#f43f5e' },
  'Ringworm': { label: 'Ringworm', color: '#06b6d4' },
  'Rosacea': { label: 'Rosacea', color: '#84cc16' },
  'Vascular Lesion': { label: 'Vascular', color: '#3b82f6' },
  'Warts': { label: 'Warts', color: '#14b8a6' },
  'Others': { label: 'Others', color: '#64748b' }
};

const PredictionsChart = () => {
  const [activeChart, setActiveChart] = useState('disease');
  const [loading, setLoading] = useState(true);
  const [diseaseData, setDiseaseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'predictions'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      
      const counts = {};
      Object.keys(DISEASE_NAMES_CONFIG).forEach(k => counts[k] = 0);
      
      const monthlyMap = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const disease = data.disease || 'Others';
        
        // Group by disease
        if (counts[disease] !== undefined) {
          counts[disease] += 1;
        } else {
          counts['Others'] += 1;
        }

        // Group by month
        if (data.createdAt) {
          const date = data.createdAt.toDate();
          const monthName = date.toLocaleString('en-US', { month: 'short' });
          const year = date.getFullYear();
          const key = `${monthName} ${year}`;
          
          if (!monthlyMap[key]) {
            monthlyMap[key] = {
              month: key,
              predictions: 0,
              users: new Set(),
              rawDate: date
            };
          }
          monthlyMap[key].predictions += 1;
          if (data.userId) {
            monthlyMap[key].users.add(data.userId);
          }
        }
      });

      // Construct disease data
      const finalDiseaseData = Object.keys(DISEASE_NAMES_CONFIG)
        .map(key => ({
          name: DISEASE_NAMES_CONFIG[key].label,
          predictions: counts[key],
          fill: DISEASE_NAMES_CONFIG[key].color
        }))
        // Only show categories with predictions if there is at least one prediction in the system,
        // otherwise show all to keep the chart schema visible.
        const totalPredictions = snapshot.docs.length;
        const filteredDiseaseData = totalPredictions > 0 
          ? finalDiseaseData.filter(d => d.predictions > 0)
          : finalDiseaseData;

      // Construct monthly data
      const finalMonthlyData = Object.values(monthlyMap)
        .sort((a, b) => a.rawDate - b.rawDate)
        .map(item => ({
          month: item.month,
          predictions: item.predictions,
          users: item.users.size
        }));

      setDiseaseData(filteredDiseaseData);
      setMonthlyData(finalMonthlyData);

    } catch (err) {
      console.error('Error fetching prediction chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Analytics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Prediction statistics overview</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchChartData}
            disabled={loading}
            className="text-xs font-semibold text-blue-600 hover:text-blue-750 disabled:opacity-40"
          >
            🔄 Refresh
          </button>
          
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setActiveChart('disease')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChart === 'disease'
                  ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              By Disease
            </button>
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChart === 'monthly'
                  ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex items-center justify-center h-[280px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Charts */}
      {!loading && (
        <>
          {activeChart === 'disease' && (
            diseaseData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-slate-450 dark:text-slate-500 text-sm">
                No prediction metrics recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={diseaseData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="predictions" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          )}

          {activeChart === 'monthly' && (
            monthlyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-slate-450 dark:text-slate-500 text-sm">
                No timeline records available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predictions"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Predictions"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          )}
        </>
      )}

    </div>
  );
};

export default PredictionsChart;