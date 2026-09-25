/**
 * Simulated WhatsApp Service
 * 
 * In a real application, you would integrate with the Meta Cloud API, 
 * Twilio, or another WhatsApp Business Solution Provider (BSP) here.
 */

const sendWhatsAppMessage = async (phone, message) => {
  try {
    // Formatting the phone number
    const normalizedPhone = phone.startsWith("91") || phone.startsWith("+") 
      ? phone 
      : `+91${phone.replace(/\D/g, "")}`; // Default to India if not specified

    console.log(`\n======================================================`);
    console.log(`💬 WHATSAPP NOTIFICATION SIMULATOR`);
    console.log(`======================================================`);
    console.log(`To: ${normalizedPhone}`);
    console.log(`Message:`);
    console.log(`${message}`);
    console.log(`======================================================\n`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, messageId: `SIM-${Date.now()}` };
  } catch (error) {
    console.error("WhatsApp sending failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppMessage
};
