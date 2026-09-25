import emailjs from '@emailjs/browser';

/**
 * Service to handle client-side email dispatching via EmailJS
 */
export const emailService = {
  /**
   * Check if EmailJS environment variables are configured
   */
  isConfigured() {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    return Boolean(serviceId && templateId && publicKey);
  },

  /**
   * Send a password reset email via EmailJS
   * @param {Object} params
   * @param {string} params.toEmail - Recipient email
   * @param {string} params.toName - Recipient user name
   * @param {string} params.resetUrl - Password reset link
   */
  async sendPasswordResetEmail({ toEmail, toName, resetUrl }) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      to_email: toEmail,
      email: toEmail,
      recipient_email: toEmail,
      to_name: toName || 'User',
      name: toName || 'User',
      reset_link: resetUrl,
      reset_url: resetUrl,
      link: resetUrl,
      action_url: resetUrl,
      message: `You requested a password reset for your DineOps account. Click the link below to set your new password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes. If you did not request this, please ignore this email.`,
      app_name: 'DineOps',
      support_email: 'support@dineops.com',
    };

    if (!serviceId || !templateId || !publicKey) {
      console.warn(
        '⚠️ EmailJS is not fully configured. Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY in client/.env'
      );
      return {
        success: true,
        simulated: true,
        message: 'EmailJS credentials not detected in .env. Reset link ready for testing.',
      };
    }

    try {
      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return {
        success: true,
        simulated: false,
        status: response.status,
        text: response.text,
      };
    } catch (error) {
      console.error('EmailJS dispatch failed:', error);
      throw new Error(
        error?.text || error?.message || 'Failed to dispatch email via EmailJS. Please verify your EmailJS configuration.'
      );
    }
  },
};

export default emailService;
