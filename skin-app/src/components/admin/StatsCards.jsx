import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { AlertTriangle, BarChart3, Camera, GitMerge, Microscope, Users } from 'lucide-react';

const StatsCards = () => {
  const [userCount, setUserCount] = useState('...');
  const [predictionCount, setPredictionCount] = useState('...');
  const [highRiskCount, setHighRiskCount] = useState('...');
  const [webcamCount, setWebcamCount] = useState('...');
  const [consensusCount, setConsensusCount] = useState('...');
  const [averageScans, setAverageScans] = useState('...');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersSnap, predsSnap, highRiskSnap, webcamSnap, consensusSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'predictions')),
          getCountFromServer(query(collection(db, 'predictions'), where('severity', '==', 'High'))),
          getCountFromServer(query(collection(db, 'predictions'), where('source', '==', 'webcam'))),
          getCountFromServer(query(collection(db, 'predictions'), where('isConsensus', '==', true)))
        ]);
        
        const usersVal = usersSnap.data().count;
        const predsVal = predsSnap.data().count;
        const highRiskVal = highRiskSnap.data().count;
        const webcamVal = webcamSnap.data().count;
        const consensusVal = consensusSnap.data().count;

        setUserCount(usersVal.toLocaleString());
        setPredictionCount(predsVal.toLocaleString());
        setHighRiskCount(highRiskVal.toLocaleString());
        setWebcamCount(webcamVal.toLocaleString());
        setConsensusCount(consensusVal.toLocaleString());

        const avg = usersVal > 0 ? (predsVal / usersVal).toFixed(1) : '0';
        setAverageScans(avg);
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        setUserCount('N/A');
        setPredictionCount('N/A');
        setHighRiskCount('N/A');
        setWebcamCount('N/A');
        setConsensusCount('N/A');
        setAverageScans('N/A');
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    {
      icon: <Users size={20} className="text-blue-600 dark:text-blue-400" />,
      label: 'Total Users',
      value: userCount,
      change: 'Registered accounts',
      changeType: 'neutral',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      border: 'border-blue-100 dark:border-blue-800',
    },
    {
      icon: <Microscope size={20} className="text-purple-600 dark:text-purple-400" />,
      label: 'Total Predictions',
      value: predictionCount,
      change: 'Realtime analysis count',
      changeType: 'neutral',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      border: 'border-purple-100 dark:border-purple-800',
    },
    {
      icon: <BarChart3 size={20} className="text-green-600 dark:text-green-400" />,
      label: 'Average Scans / User',
      value: averageScans,
      change: 'Usage density',
      changeType: 'neutral',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      border: 'border-green-100 dark:border-green-800',
    },
    {
      icon: <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />,
      label: 'High Risk Cases',
      value: highRiskCount,
      change: 'High severity actions',
      changeType: 'neutral',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      border: 'border-red-100 dark:border-red-800',
    },
    {
      icon: <Camera size={20} className="text-cyan-600 dark:text-cyan-400" />,
      label: 'Webcam Scans',
      value: webcamCount,
      change: 'Captured via camera',
      changeType: 'neutral',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
      border: 'border-cyan-100 dark:border-cyan-800',
    },
    {
      icon: <GitMerge size={20} className="text-amber-600 dark:text-amber-400" />,
      label: 'Consensus Predictions',
      value: consensusCount,
      change: 'Multi-image reviews',
      changeType: 'neutral',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      border: 'border-amber-100 dark:border-amber-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bg} ${stat.border} border rounded-2xl p-5 hover:shadow-md transition-all`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              stat.changeType === 'up'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : stat.changeType === 'down'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {stat.changeType === 'up' ? '↑' : stat.changeType === 'down' ? '↓' : '•'} {stat.change}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;