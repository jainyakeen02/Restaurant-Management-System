import React from 'react';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary dark:text-primary-dark tracking-tight">
                DineOps
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-primary-dark transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-primary dark:text-gray-300 dark:hover:text-primary-dark transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full">
                  2
                </span>
              </button>
              <button className="hidden sm:flex items-center p-2 text-gray-500 hover:text-primary dark:text-gray-300 transition-colors">
                <User className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center text-primary dark:text-primary-dark">
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
          <Search className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Search</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors relative">
          <div className="relative">
             <ShoppingBag className="w-6 h-6 mb-1" />
             <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full border border-white">2</span>
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerLayout;
