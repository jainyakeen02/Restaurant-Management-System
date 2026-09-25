import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import {
  Plus, Minus, ArrowLeft, MapPin, Store, Loader2, Sparkles,
  Search, Flame, Leaf, Utensils, ChevronLeft, ChevronRight,
  Star, Clock, ShoppingBag, Check, Info, SlidersHorizontal,
  X, UserCheck, ArrowRight, CheckCircle2, LogIn, UserPlus,
  Truck, MessageCircle, CreditCard, Navigation
} from 'lucide-react';

const MOCK_CATEGORIES = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts'];

const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.country, address.postalcode].filter(Boolean);
  return parts.join(', ');
};

const CustomerMenu = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [branch, setBranch] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(true);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cart, setCart] = useState([]);
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY', 'TAKEAWAY', 'DINE_IN'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    landmark: '',
    city: '',
    pincode: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  const categoryScrollRef = useRef(null);

  useEffect(() => {
    const fetchBranchAndMenu = async () => {
      let activeBranchId = branchId;

      try {
        if (activeBranchId) {
          const res = await apiClient.get(`/restaurants/${activeBranchId}`);
          if (res.data?.data) {
            setBranch(res.data.data);
          }
        } else {
          // If accessing without branchId (e.g. root /), fetch default active restaurant
          const res = await apiClient.get('/restaurants');
          if (res.data?.data && res.data.data.length > 0) {
            setBranch(res.data.data[0]);
            activeBranchId = res.data.data[0]._id;
          }
        }
      } catch (err) {
        console.error('Error loading branch details:', err);
      } finally {
        setLoadingBranch(false);
      }

      // Fetch menu items and categories
      try {
        setLoadingMenu(true);
        const queryParams = activeBranchId ? { restaurant: activeBranchId } : {};
        const [itemsRes, catRes] = await Promise.all([
          apiClient.get('/menu/items', { params: queryParams }),
          apiClient.get('/menu/categories', { params: queryParams })
        ]);

        if (catRes.data?.data && catRes.data.data.length > 0) {
          const catNames = ['All', ...catRes.data.data.map(c => c.name)];
          setCategories(catNames);
        }

        if (itemsRes.data?.data && itemsRes.data.data.length > 0) {
          const apiProducts = itemsRes.data.data.map(item => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category?.name || 'General',
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
            description: item.description || '',
            dietaryPreference: item.dietaryPreference || 'veg',
            spiciness: item.spiciness || 'medium',
            preparationTime: item.preparationTime || 15
          }));
          setProducts(apiProducts);

          if (!catRes.data?.data || catRes.data.data.length === 0) {
            const uniqueCats = ['All', ...new Set(apiProducts.map(p => p.category))];
            setCategories(uniqueCats);
          }
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchBranchAndMenu();
  }, [branchId]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const addToCart = (product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const getItemCartQuantity = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  // Handle Checkout / Place Order
  const handleCheckoutOrder = () => {
    if (!user) {
      // User is not logged in: Prompt them to Sign In or Register
      setShowAuthModal(true);
      return;
    }
    if (cart.length === 0) return;

    setCustomerName(user.name || '');
    setCustomerPhone(user.phone || '');
    setCheckoutError(null);
    setShowCheckoutModal(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!branch?._id) return;
    setIsPlacingOrder(true);
    setCheckoutError(null);

    try {
      const payload = {
        restaurant: branch._id,
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        orderType,
        customerName: customerName || user?.name || 'Customer',
        customerPhone: customerPhone || user?.phone || '',
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
        notes: orderNotes,
        paymentMethod,
      };

      const res = await apiClient.post('/orders', payload);
      if (res.data?.data?._id) {
        localStorage.setItem('dineops_last_order', res.data.data._id);
      }
      setPlacedOrder(res.data);
      setCart([]);
      setShowCheckoutModal(false);
      setOrderSuccessModal(true);
    } catch (err) {
      console.error('Failed to place order:', err);
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesDiet = dietaryFilter === 'all' || p.dietaryPreference === dietaryFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCat && matchesDiet && matchesSearch;
  });

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation & Restaurant Banner */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/branches" 
              className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
              Switch branch
            </Link>

            {!user && (
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span>Browsing Menu as Guest</span>
                <Link 
                  to="/auth?tab=customer&mode=login" 
                  className="text-primary hover:underline font-bold"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Restaurant Header Card */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {loadingBranch ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading branch...
                        </span>
                      ) : (
                        branch?.name || 'DineOps Restaurant'
                      )}
                    </h1>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Open Now
                    </span>
                  </div>

                  {branch?.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{formatAddress(branch.address)}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.8 (500+ reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> 20–30 mins prep
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-gray-400" /> {products.length} dishes available
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Branch Highlights */}
              <div className="flex items-center gap-3 self-start md:self-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-600">
                <div className="text-center px-3 border-r border-gray-200 dark:border-gray-600">
                  <span className="block text-lg font-black text-gray-900 dark:text-white">
                    {categories.length > 1 ? categories.length - 1 : categories.length}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Categories</span>
                </div>
                <div className="text-center px-3">
                  <span className="block text-lg font-black text-primary">₹80+</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Starting at</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section: Menu + Cart */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Menu Catalog Area */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Guest Login Required Notice */}
            {!user && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Customer Login Required to Place Orders
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Sign in or create your customer profile to select dishes and proceed to checkout.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                  <button
                    onClick={() => navigate('/auth?tab=customer&mode=login')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-primary hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/auth?tab=customer&mode=signup')}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Search Box */}
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes, cuisines, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dietary Filter Buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setDietaryFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    dietaryFilter === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    dietaryFilter === 'veg'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Pure Veg
                </button>
              </div>
            </div>

            {/* Category Pill Bar with Smooth Left/Right Navigation */}
            <div className="relative mb-6">
              <button
                onClick={() => scrollCategories('left')}
                aria-label="Scroll categories left"
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories('right')}
                aria-label="Scroll categories right"
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Results Title & Count */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{activeCategory}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  {filteredProducts.length} items
                </span>
              </h2>
            </div>

            {/* Loading State */}
            {loadingMenu ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                <Utensils className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No items found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your search query or switching categories.
                </p>
                <button
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); setDietaryFilter('all'); }}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* High Performance Responsive Menu Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map(product => {
                  const cartQty = getItemCartQuantity(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 flex flex-col overflow-hidden group"
                    >
                      {/* Card Image Container */}
                      <div className="relative w-full h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />

                        {/* Dietary Badge Tag */}
                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-gray-200/50 dark:border-gray-700">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-700 dark:text-green-400">
                            Pure Veg
                          </span>
                        </div>

                        {/* Category Tag */}
                        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px] leading-relaxed">
                            {product.description || 'Prepared fresh with premium ingredients and aromatic spices.'}
                          </p>
                        </div>

                        {/* Card Footer: Price and Add Button */}
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-gray-700/60">
                          <div>
                            <span className="text-xs text-gray-400 block font-medium">Price</span>
                            <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                              ₹{product.price}
                            </span>
                          </div>

                          {cartQty > 0 ? (
                            <div className="flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 rounded-xl px-2 py-1 border border-primary/30">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-primary font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold text-sm text-primary dark:text-rose-400 px-1">
                                {cartQty}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                                user 
                                  ? 'bg-primary hover:bg-rose-700 text-white shadow-primary/20' 
                                  : 'bg-gray-900 hover:bg-black dark:bg-primary dark:hover:bg-rose-700 text-white shadow-gray-900/20'
                              }`}
                            >
                              {user ? (
                                <>
                                  <Plus className="w-4 h-4" />
                                  <span>ADD</span>
                                </>
                              ) : (
                                <>
                                  <LogIn className="w-3.5 h-3.5" />
                                  <span>Sign In to Order</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Sticky Cart Sidebar */}
          <div className="hidden lg:block w-84 xl:w-92 shrink-0 sticky top-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg p-5 flex flex-col max-h-[calc(100vh-6rem)]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Your Order</h3>
                </div>
                {user && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {/* Cart Body */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                {!user ? (
                  <div className="text-center py-8 px-2">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-3">
                      <LogIn className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                      Login Required to Order
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                      Please log in or create an account first to select items and place your order.
                    </p>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigate('/auth?tab=customer&mode=login')}
                        className="w-full py-2.5 px-3 btn-primary rounded-xl font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In as Customer</span>
                      </button>
                      <button
                        onClick={() => navigate('/auth?tab=customer&mode=signup')}
                        className="w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-100 transition-colors"
                      >
                        Create New Account
                      </button>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600 opacity-60" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
                    <p className="text-xs mt-1 text-gray-400">Click '+ ADD' on any dish to begin your order!</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate">
                          {item.name}
                        </h4>
                        <span className="text-primary font-bold text-xs mt-0.5 block">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-600 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs w-4 text-center dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-primary text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Pricing & Checkout */}
              {user && cart.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Item Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Taxes & Charges</span>
                    <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>Grand Total</span>
                    <span className="text-primary">₹{(cartTotal * 1.05).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckoutOrder}
                    className="w-full mt-3 py-3 bg-primary hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Pay</span>
                    <span className="text-xs font-semibold opacity-80">
                      (₹{(cartTotal * 1.05).toFixed(2)})
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Floating Cart Bar */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-18 left-4 right-4 z-40 bg-gray-900 dark:bg-primary text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-fade-in">
            <div>
              <span className="text-xs uppercase tracking-wider text-gray-300 font-semibold block">
                {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
              </span>
              <span className="text-lg font-black">
                ₹{(cartTotal * 1.05).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutOrder}
              className="px-5 py-2.5 bg-primary dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
            >
              <span>Place Order</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─── AUTHENTICATION REQUIRED MODAL ────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all p-6 text-center">
            
            {/* Close Button */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Icon & Header */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <LogIn className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              Sign In to Order
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Please log in or create a customer account to place your order and enjoy real-time delivery updates.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth?tab=customer&mode=login')}
                className="w-full py-3.5 px-4 btn-primary rounded-xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Customer</span>
              </button>

              <button
                onClick={() => navigate('/auth?tab=customer&mode=signup')}
                className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
              >
                Continue Browsing Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHECKOUT & DELIVERY DETAILS MODAL ───────────────────────── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Confirm Your Order
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Ordering from <span className="font-bold text-primary">{branch?.name || 'DineOps'}</span>
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
              {checkoutError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Order Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'DELIVERY', label: 'Delivery', icon: Truck },
                    { key: 'DINE_IN', label: 'Dine-In', icon: Utensils },
                    { key: 'TAKEAWAY', label: 'Takeaway', icon: ShoppingBag },
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = orderType === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setOrderType(t.key)}
                        className={`py-3 px-2 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address Fields (Only when DELIVERY is selected) */}
              {orderType === 'DELIVERY' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Delivery Address</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      required={orderType === 'DELIVERY'}
                      placeholder="Flat / House / Building No. & Street"
                      className="input-field text-xs py-2"
                      value={deliveryAddress.street}
                      onChange={e => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      className="input-field text-xs py-2"
                      value={deliveryAddress.landmark}
                      onChange={e => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                    />
                    <input
                      type="text"
                      required={orderType === 'DELIVERY'}
                      placeholder="Pincode"
                      className="input-field text-xs py-2"
                      value={deliveryAddress.pincode}
                      onChange={e => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      required={orderType === 'DELIVERY'}
                      placeholder="City (e.g. Ahmedabad)"
                      className="input-field text-xs py-2"
                      value={deliveryAddress.city}
                      onChange={e => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="input-field text-xs py-2"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="input-field text-xs py-2"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Cooking / Delivery Instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cooking / Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, call before delivery"
                  className="input-field text-xs py-2"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ONLINE', label: 'Online / UPI', desc: 'Prepaid order' },
                    { key: 'CASH', label: 'Cash on Delivery', desc: 'Pay when delivered' },
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPaymentMethod(p.key)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === p.key
                          ? 'border-primary bg-primary/10 text-primary shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <p className="font-bold text-xs">{p.label}</p>
                      <p className="text-[10px] opacity-75">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal ({totalCartItems} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>GST & Restaurant Tax (5%)</span>
                  <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-600">
                  <span>Total Payable</span>
                  <span className="text-primary font-black">₹{(cartTotal * 1.05).toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing your order with kitchen...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── REAL ORDER CONFIRMATION / SUCCESS MODAL ────────────────────── */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-4 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              Order Confirmed! 🎉
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              Your order has been sent directly to <span className="font-bold text-gray-800 dark:text-gray-200">{branch?.name || 'the kitchen'}</span>.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 mb-6 text-left space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  #{placedOrder?.data?.billNumber || 'DINE-ORDER'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {placedOrder?.data?.orderType || orderType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {orderType === 'DELIVERY' ? '30 - 40 minutes' : '15 - 25 minutes'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-primary">
                  ₹{placedOrder?.data?.total || (cartTotal * 1.05).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Live Tracking Button */}
              {placedOrder?.data?._id && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSuccessModal(false);
                    navigate(`/track-order/${placedOrder.data._id}`);
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Track Order & Delivery Status</span>
                </button>
              )}

              {/* WhatsApp Notification Button */}
              {placedOrder?.whatsappUrl && (
                <a
                  href={placedOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Send Tracking Link to WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setOrderSuccessModal(false);
                }}
                className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerMenu;
