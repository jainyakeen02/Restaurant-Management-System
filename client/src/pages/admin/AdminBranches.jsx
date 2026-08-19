import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../api/apiClient';
import { Store, MapPin, Phone, Mail, RefreshCw, AlertCircle, Plus, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';

// ─── Create Branch Modal ──────────────────────────────────────────────────────
const CreateBranchModal = ({ onClose, onSuccess, organizations }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '', code: '',
    street: '', city: '', state: '', country: 'India', postalcode: '',
    phone: '', email: '',
    organization: organizations[0]?._id || ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        address: { street: form.street, city: form.city, state: form.state, country: form.country, postalcode: form.postalcode },
        contact: { phone: form.phone, email: form.email }
      };
      // Only attach organization if a valid one was selected
      if (form.organization) {
        payload.organization = form.organization;
      }
      await apiClient.post('/restaurants', payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create branch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Branch</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Branch Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Name *</label>
                <input name="name" required className="input-field" placeholder="e.g. Downtown Branch" value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Code * (8-10 chars)</label>
                <input name="code" required minLength={8} maxLength={10} className="input-field uppercase" placeholder="e.g. DWNTWN01" value={form.code} onChange={handleChange} />
              </div>
              {organizations.length > 0 ? (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                  <select name="organization" className="input-field" value={form.organization} onChange={handleChange}>
                    <option value="">— None (assign later) —</option>
                    {organizations.map(org => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sm:col-span-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> No Organizations exist yet. The branch will be created without an organization and can be linked later.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                <input name="street" className="input-field" placeholder="123 Main Street" value={form.street} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                <input name="city" required className="input-field" placeholder="Mumbai" value={form.city} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                <input name="state" required className="input-field" placeholder="Maharashtra" value={form.state} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country *</label>
                <input name="country" required className="input-field" value={form.country} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code *</label>
                <input name="postalcode" required className="input-field" placeholder="400001" value={form.postalcode} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                <input name="phone" required className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input name="email" type="email" required className="input-field" placeholder="branch@dineops.com" value={form.email} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchRes, orgRes] = await Promise.all([
        apiClient.get('/restaurants'),
        apiClient.get('/organizations')
      ]);
      setBranches(branchRes.data.data || []);
      setOrganizations(orgRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSuccess = () => {
    setShowModal(false);
    fetchData();
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    const parts = [address.street, address.city, address.state].filter(Boolean);
    return parts.join(', ') || 'No address';
  };

  return (
    <AdminLayout>
      {showModal && (
        <CreateBranchModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          organizations={organizations}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branches</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage all restaurant branches — {branches.length} total.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} disabled={loading} title="Refresh" className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Create Branch
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={fetchData} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card bg-white dark:bg-gray-800 animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No branches yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first restaurant branch to get started.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> Create First Branch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map(branch => (
              <div key={branch._id} className="card bg-white dark:bg-gray-800 hover:shadow-md transition-all flex flex-col border-2 border-transparent hover:border-primary/20">
                <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                    alt={branch.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{branch.name}</h3>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{branch.code}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${branch.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {branch.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {branch.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{formatAddress(branch.address)}</span>
                  </div>
                  {branch.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span>{branch.contact.phone}</span>
                    </div>
                  )}
                  {branch.contact?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{branch.contact.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBranches;
