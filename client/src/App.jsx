import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center space-y-6">
      <div className="card max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary dark:text-primary-dark">
          DineOps Platform
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Design system and theme configuration successfully initialized.
        </p>
        
        <div className="pt-4 flex justify-center space-x-4">
          <button className="btn-primary">
            Primary Action
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>
      
      <div className="card max-w-md w-full space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2 dark:border-gray-700">Form Elements</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input type="text" className="input-field" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
