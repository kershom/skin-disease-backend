import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const UsersTable = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map((doc, index) => ({
        id:          doc.id,
        index:       index + 1,
        displayName: doc.data().displayName || 'Unknown',
        email:       doc.data().email || '',
        photoURL:    doc.data().photoURL || '',
        createdAt:   doc.data().createdAt?.toDate().toLocaleDateString('en-IN') || 'N/A',
        lastLogin:   doc.data().lastLogin?.toDate().toLocaleDateString('en-IN') || 'N/A',
        phone:       doc.data().phone || '—',
        scans:       doc.data().scans || 0,
      }));
      setUsers(userList);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Check Firestore rules.');
    }
    setLoading(false);
  };

  // Filter users by search
  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              👥 Registered Users
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All users from Firebase Authentication
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* User count badge */}
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-lg">
              {users.length} users
            </span>
            {/* Refresh button */}
            <button
              onClick={fetchUsers}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by name or email..."
            className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3 animate-pulse">👥</div>
          <p className="text-slate-400 text-sm">Loading users from Firebase...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
            <span>❌</span>
            <div>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="text-red-600 dark:text-red-400 text-xs underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search ? 'No users match your search' : 'No users registered yet'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">#</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 hidden sm:table-cell">Email</th>
                <th className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3">Predictions</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 hidden md:table-cell">Phone</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-6 py-3 hidden lg:table-cell">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-400">{user.index}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar — show photo if available */}
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold shrink-0">
                          {user.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        {user.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {user.scans}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {user.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!loading && !error && users.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
          <p className="text-xs text-slate-400">
            Showing {filtered.length} of {users.length} users
            {search && ` matching "${search}"`}
          </p>
        </div>
      )}

    </div>
  );
};

export default UsersTable;