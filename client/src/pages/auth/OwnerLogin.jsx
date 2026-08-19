import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  AlertCircle,
  Loader2,
  Building2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

const OwnerLogin = () => {
  const navigate = useNavigate();
  const { ownerLogin } = useAuth();

  const [formData, setFormData] = useState({ name: '', code: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Hardcoded to branch since Organization and Branch are now treated the same
    const result = await ownerLogin(formData.name, formData.code, 'branch');

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <UtensilsCrossed className="w-10 h-10 text-primary dark:text-primary-dark" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">DineOps</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Owner Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Sign in using your branch credentials
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card bg-white dark:bg-gray-800 py-8 px-4 sm:px-10 shadow-xl border-gray-100 dark:border-gray-700">

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="owner-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Name
              </label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="owner-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Spice Empire – Downtown"
                  className="input-field pl-9"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Access Code */}
            <div>
              <label htmlFor="owner-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Access Code
              </label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="owner-code"
                  name="code"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. SPICEEMP01"
                  className="input-field pl-9 uppercase tracking-widest font-semibold"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                Code is provided by your Super Admin
              </p>
            </div>

            {/* Submit */}
            <button
              id="owner-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 flex justify-center items-center text-lg shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Sign In as Branch Owner'
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
