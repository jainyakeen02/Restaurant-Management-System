import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../api/apiClient';
import { Users, RefreshCw, AlertCircle, Search } from 'lucide-react';

const AdminBranchOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/stats');
      // Reuse the branchOwners from stats endpoint
      setOwners(res.data.data?.branchOwners || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load branch owners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOwners(); }, []);

  const filtered = owners.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Owners</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">All organization owners registered on the platform.</p>
          </div>
          <button onClick={fetchOwners} disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={fetchOwners} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input-field pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="card bg-white dark:bg-gray-800 overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {search ? 'No owners match your search.' : 'No Branch Owners registered yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((owner, idx) => (
                  <tr key={owner._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {owner.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{owner.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{owner.email}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBranchOwners;
