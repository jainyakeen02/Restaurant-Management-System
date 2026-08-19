import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MOCK_CATEGORIES = ['All', 'Popular', 'Pizza', 'Burgers', 'Chinese', 'Beverages', 'Desserts'];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Margherita Pizza', price: 299, category: 'Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80' },
  { id: 2, name: 'Spicy Paneer Burger', price: 149, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
  { id: 3, name: 'Hakka Noodles', price: 199, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&q=80' },
  { id: 4, name: 'Cold Coffee', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&q=80' },
  { id: 5, name: 'Pepperoni Pizza', price: 450, category: 'Pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&q=80' },
  { id: 6, name: 'Chocolate Brownie', price: 180, category: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&q=80' },
];

const AdminBilling = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing.quantity === 1) {
        return prev.filter(item => item.id !== productId);
      }
      return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxes = subtotal * 0.05; // 5% tax
  const total = subtotal + taxes;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert(`Order placed successfully for ₹${total.toFixed(2)}`);
    setCart([]); // Clear cart
  };

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        
        {/* Menu Section */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">POS / Menu ({user?.name || 'Branch'})</h2>
            {/* Categories */}
            <div className="mt-4 overflow-x-auto no-scrollbar pb-2">
              <div className="flex space-x-2">
                {MOCK_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-primary transition-colors" onClick={() => addToCart(product)}>
                  <div className="h-32 bg-gray-200">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm line-clamp-1">{product.name}</p>
                    <p className="text-primary font-bold text-sm mt-1">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Current Order
            </h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors">
                          <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors">
                          <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-gray-800 dark:text-white w-12 text-right">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Taxes (5%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
            >
              <CreditCard className="w-5 h-5" /> Place Order
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminBilling;
