/**
 * Email Service using EmailJS REST API
 * 
 * Supports sending emails directly from Node.js backend using EmailJS API:
 * https://api.emailjs.com/api/v1.0/email/send
 */

const sendEmail = async ({ toEmail, toName, resetUrl }) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional accessToken in EmailJS

  if (!serviceId || !templateId || !publicKey) {
    console.log(`\n======================================================`);
    console.log(`📧 EMAIL NOTIFICATION (Dev / Simulation)`);
    console.log(`======================================================`);
    console.log(`To: ${toName} <${toEmail}>`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Note: Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY in .env to send real emails.`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        email: toEmail,
        to_name: toName || 'User',
        name: toName || 'User',
        reset_link: resetUrl,
        reset_url: resetUrl,
        app_name: 'DineOps',
      },
    };

    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('EmailJS backend request failed:', errText);
      return { success: false, error: errText };
    }

    console.log(`✅ Email sent successfully via EmailJS to ${toEmail}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
};
