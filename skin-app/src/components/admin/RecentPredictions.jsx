import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { History, Loader2 } from 'lucide-react';

const severityBadge = {
  Low:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  High:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const RecentPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const PAGE_SIZE = 15;

  const fetchPredictions = async (isFirstPage = true) => {
    if (isFirstPage) {
      setLoading(true);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let q;
      if (isFirstPage) {
        q = query(
          collection(db, 'predictions'),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
      } else if (lastDoc) {
        q = query(
          collection(db, 'predictions'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      } else {
        return;
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        if (isFirstPage) {
          setPredictions([]);
        }
        setHasMore(false);
        return;
      }

      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        
        let timeStr = 'N/A';
        if (data.createdAt) {
          const dateVal = data.createdAt.toDate();
          timeStr = dateVal.toLocaleDateString('en-IN') + ' ' + dateVal.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        }

        return {
          id: doc.id,
          user: data.userName || 'Unknown User',
          email: data.userEmail || '',
          disease: data.disease || 'Unknown',
          confidence: (data.confidence || 0) + '%',
          severity: data.severity || 'Medium',
          time: timeStr,
          isConsensus: data.isConsensus || false
        };
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

      if (isFirstPage) {
        setPredictions(list);
      } else {
        setPredictions(prev => [...prev, ...list]);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPredictions(true);
    
  }, []);

  const filteredPredictions = predictions.filter(item => {
    const matchesSearch = 
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.disease.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = 
      severityFilter === 'All' || 
      item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Predictions History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Browse and filter AI scans across all users</p>
          </div>
          <button
            onClick={() => fetchPredictions(true)}
            disabled={loading}
            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search by user name, email, or disease..."
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
            />
          </div>
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPredictions.length === 0 && (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          No predictions recorded matching your criteria.
        </div>
      )}

      {/* List */}
      {!loading && filteredPredictions.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredPredictions.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-bold shrink-0">
                  {item.user[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.user}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-450">({item.email})</span>
                    {item.isConsensus && (
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold border border-indigo-100 dark:border-indigo-900/40">
                        Consensus
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.disease}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 hidden sm:block">
                  {item.confidence}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${severityBadge[item.severity]}`}>
                  {item.severity}
                </span>
                <span className="text-[11px] text-slate-400 hidden md:block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && hasMore && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-center bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={() => fetchPredictions(false)}
            disabled={loadingMore}
            className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Loading more...</span>
              </>
            ) : (
              <span>Load More Predictions</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentPredictions;