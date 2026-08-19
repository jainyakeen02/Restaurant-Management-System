import React, { useState } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';
import { Plus } from 'lucide-react';

const MOCK_CATEGORIES = ['All', 'Popular', 'Pizza', 'Burgers', 'Chinese', 'Beverages', 'Desserts'];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Margherita Pizza', price: 299, category: 'Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', description: 'Classic cheese and tomato base.' },
  { id: 2, name: 'Spicy Paneer Burger', price: 149, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', description: 'Crispy paneer patty with spicy mayo.' },
  { id: 3, name: 'Hakka Noodles', price: 199, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80', description: 'Wok tossed noodles with fresh veggies.' },
  { id: 4, name: 'Cold Coffee', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80', description: 'Thick and creamy blended coffee.' },
  { id: 5, name: 'Pepperoni Pizza', price: 450, category: 'Pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', description: 'Loaded with pepperoni and extra cheese.' },
  { id: 6, name: 'Chocolate Brownie', price: 180, category: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80', description: 'Warm fudgy brownie with ice cream.' },
];

const CustomerMenu = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <CustomerLayout>
      <div className="flex flex-col md:flex-row h-full">
        {/* Main Menu Area */}
        <div className="flex-1 px-4 py-6 md:pr-8">
          
          {/* Branch Header */}
          <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ahmedabad Main Branch</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open until 11:00 PM</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Open</span>
          </div>

          {/* Categories (Horizontal Scroll) */}
          <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
            <div className="flex space-x-3">
              {MOCK_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 transform scale-105' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 group flex flex-row sm:flex-col h-32 sm:h-auto">
                {/* Image */}
                <div className="w-32 sm:w-full sm:h-48 relative overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{product.name}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-4">{product.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">₹{product.price}</span>
                    <button className="bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-dark dark:bg-primary-dark/10 p-2 rounded-lg transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Cart Sidebar (Hidden on mobile) */}
        <div className="hidden md:block w-80 lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16 shadow-xl p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Cart</h2>
          
          <div className="flex-1 overflow-y-auto">
            {/* Mock Cart Item */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Margherita Pizza</h4>
                <span className="text-gray-500 text-sm">₹299</span>
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <button className="text-gray-600 dark:text-gray-300 font-bold px-2">-</button>
                <span className="font-semibold w-4 text-center dark:text-white">1</span>
                <button className="text-primary font-bold px-2">+</button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹299.00</span>
            </div>
            <div className="flex justify-between mb-4 font-bold text-lg text-gray-900 dark:text-white">
              <span>Total</span>
              <span>₹299.00</span>
            </div>
            <button className="w-full btn-primary py-4 text-lg rounded-xl shadow-lg shadow-primary/30 transform hover:-translate-y-1 transition-all">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerMenu;
