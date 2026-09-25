import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import {
  UtensilsCrossed,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  KeyRound
} from 'lucide-react';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessData(null);
    setCopied(false);

    try {
      const cleanInput = identifier.trim();
      const isEmail = cleanInput.includes('@');
      const payload = isEmail ? { email: cleanInput } : { phone: cleanInput };

      const res = await apiClient.post('/auth/forgotpassword', payload);
      const { whatsappUrl, resetUrl, resetToken, phone, email, name } = res.data;

      setSuccessData({
        whatsappUrl,
        resetUrl,
        resetToken,
        phone: phone || (!isEmail ? cleanInput : null),
        email,
        name,
      });

      // Automatically open WhatsApp direct link if available
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to find an account with those details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (successData?.resetUrl) {
      navigator.clipboard.writeText(successData.resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <UtensilsCrossed className="w-10 h-10 text-primary dark:text-primary-dark" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">DineOps</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Enter your registered phone number or email to receive your password reset link on WhatsApp.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card bg-white dark:bg-gray-800 py-8 px-4 sm:px-10 shadow-xl border-gray-100 dark:border-gray-700">

          {/* Success State */}
          {successData ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <MessageCircle className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  WhatsApp Link Ready!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  A direct WhatsApp reset link has been generated for{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {successData.phone || successData.email || 'your account'}
                  </span>.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  ⏰ The link will expire in 10 minutes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {successData.whatsappUrl && (
                  <a
                    href={successData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Open WhatsApp to Set Password</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-75" />
                  </a>
                )}

                <a
                  href={successData.resetUrl}
                  className="w-full py-3 px-4 rounded-xl btn-primary font-semibold flex items-center justify-center gap-2 shadow-md transition-all text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Set Password Directly on this Device</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-75" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-4 rounded-xl btn-secondary font-medium flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Reset Link'}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setIdentifier('');
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Need to reset for a different number?
                </button>

                <Link
                  to="/auth?mode=login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Registered Phone Number or Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs text-gray-300 dark:text-gray-600">/</span>
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or admin@dineops.com"
                      className="input-field pl-16"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    Enter the phone number or email linked to your account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Send Password Reset Link on WhatsApp</span>
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/auth?mode=login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
