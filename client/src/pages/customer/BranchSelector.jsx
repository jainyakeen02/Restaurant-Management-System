import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { MapPin, Search, ChevronRight, Store, Loader2 } from 'lucide-react';
import CustomerLayout from '../../layouts/CustomerLayout';

const formatAddress = (address) => {
  if (!address) return 'Address not provided';
  if (typeof address === 'string') return address;
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalcode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not provided';
};

const BranchSelector = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // This will hit the protected GET /api/restaurants route
        const response = await apiClient.get('/restaurants');
        // Handle standard response format { success: true, data: [...] }
        setBranches(response.data.data || []);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches. Please check your connection or login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const filteredBranches = branches.filter((branch) => {
    const name = branch.name || '';
    const addressStr = formatAddress(branch.address);
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      addressStr.toLowerCase().includes(query)
    );
  });

  return (
    <CustomerLayout>
      <div className="px-4 py-8 max-w-5xl mx-auto min-h-[calc(100vh-16rem)] flex flex-col">
        
        {/* Header & Search */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Select a Restaurant</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Choose a branch near you to view their menu and place an order.</p>
          
          <div className="relative max-w-xl mx-auto sm:mx-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location..."
              className="input-field pl-10 py-3 text-lg shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* State Handling */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading restaurants from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 border border-red-100 dark:border-red-900/30">
            <Store className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Could not load branches</h3>
            <p className="text-red-600 dark:text-red-300 max-w-md">{error}</p>
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <Store className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No branches found</h3>
            <p className="text-gray-500 dark:text-gray-400">We couldn't find any restaurants matching your search.</p>
          </div>
        ) : (
          /* Branch Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map(branch => (
              <button
                key={branch._id}
                onClick={() => navigate(`/order/${branch._id}`)}
                className="group card bg-white dark:bg-gray-800 text-left flex flex-col h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-700 w-full rounded-lg mb-4 overflow-hidden relative">
                  {/* Fallback image logic */}
                  <img 
                    src={branch.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"} 
                    alt={branch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {(branch.status === 'inactive' || branch.isActive === false) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Temporarily Closed</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{branch.name}</h3>
                
                <div className="flex items-start text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{formatAddress(branch.address)}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {branch.contact?.phone || branch.contactNumber || 'No contact info'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default BranchSelector;
