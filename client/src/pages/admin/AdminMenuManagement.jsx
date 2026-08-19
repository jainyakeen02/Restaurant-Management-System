import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import apiClient from '../../api/apiClient';
import {
  UtensilsCrossed, RefreshCw, AlertCircle, Plus, X, Loader2,
  Tag, Trash2, Pencil, ChevronDown, ChevronUp
} from 'lucide-react';

// ─── Add Item Modal ───────────────────────────────────────────────────────────
const AddItemModal = ({ onClose, onSuccess, categories, branches }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', restaurant: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Find the organization from the selected category
      const selectedCategory = categories.find(c => c._id === form.category);
      await apiClient.post('/menu/items', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        organization: selectedCategory?.organization,
        restaurant: form.restaurant || undefined
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create menu item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Menu Item</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
            <input name="name" required className="input-field" placeholder="e.g. Margherita Pizza" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea name="description" rows={2} className="input-field resize-none" placeholder="Short description..." value={form.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" required className="input-field" placeholder="299" value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select name="category" required className="input-field" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Branch (optional)</label>
            <select name="restaurant" className="input-field" value={form.restaurant} onChange={handleChange}>
              <option value="">All Branches (Platform-wide)</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Add Category Modal ───────────────────────────────────────────────────────
const AddCategoryModal = ({ onClose, onSuccess, organizations }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', organization: organizations[0]?._id || '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/menu/categories', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Category</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500" /><p className="text-sm text-red-700">{error}</p></div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
            <input name="name" required className="input-field" placeholder="e.g. Pizza, Beverages" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input name="description" className="input-field" placeholder="Optional description" value={form.description} onChange={handleChange} />
          </div>
          {organizations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization *</label>
              <select name="organization" required className="input-field" value={form.organization} onChange={handleChange}>
                {organizations.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Menu Management Page ────────────────────────────────────────────────
const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, catsRes, branchRes, orgRes] = await Promise.all([
        apiClient.get('/menu/items'),
        apiClient.get('/menu/categories'),
        apiClient.get('/restaurants'),
        apiClient.get('/organizations')
      ]);
      setMenuItems(itemsRes.data.data || []);
      setCategories(catsRes.data.data || []);
      setBranches(branchRes.data.data || []);
      setOrganizations(orgRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this menu item?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/menu/items/${id}`);
      setMenuItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    setShowAddItem(false);
    setShowAddCategory(false);
    fetchAll();
  };

  // Group items by category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat._id] = {
      category: cat,
      items: menuItems.filter(i => i.category?._id === cat._id || i.category === cat._id)
    };
    return acc;
  }, {});

  // Uncategorized items
  const categorizedIds = new Set(menuItems.filter(i => i.category).map(i => i.category?._id || i.category));
  const uncategorized = menuItems.filter(i => !categorizedIds.has(i._id));

  return (
    <AdminLayout>
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} onSuccess={handleSuccess} categories={categories} branches={branches} />}
      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} onSuccess={handleSuccess} organizations={organizations} />}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {menuItems.length} items across {categories.length} categories (Super Admin Control).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} disabled={loading} title="Refresh" className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary transition-colors">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowAddCategory(true)} className="px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4" /> Add Category
            </button>
            <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={fetchAll} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card bg-white dark:bg-gray-800 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3].map(j => <div key={j} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>)}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 && menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Menu is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start by creating a category, then add items.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAddCategory(true)} className="px-5 py-2.5 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium">
                Add Category
              </button>
              <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(grouped).map(({ category, items }) => (
              <div key={category._id} className="card bg-white dark:bg-gray-800">
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{items.length} items</p>
                    </div>
                  </div>
                  {expandedCategory === category._id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {expandedCategory === category._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {items.length === 0 ? (
                      <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">No items in this category yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => (
                          <div key={item._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.description || '—'}</p>
                              <p className="text-primary dark:text-primary-dark font-bold mt-1">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                disabled={deletingId === item._id}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                {deletingId === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMenuManagement;
