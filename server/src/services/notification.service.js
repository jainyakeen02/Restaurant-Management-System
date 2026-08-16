const fs = require("fs");
const path = require("path");
const emailService = require("./email.service");

const sendOrderConfirmationEmail = async (order, customer, restaurant) => {
  try {
    // 1. Read the template
    const templatePath = path.join(__dirname, "../templates/email/order-confirmation.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // 2. Replace placeholders (Very basic templating for demonstration)
    htmlTemplate = htmlTemplate.replace("{{CUSTOMER_NAME}}", customer.name || "Valued Customer");
    htmlTemplate = htmlTemplate.replace("{{RESTAURANT_NAME}}", restaurant.name || "DineOps");
    htmlTemplate = htmlTemplate.replace("{{ORDER_NUMBER}}", order._id.toString());
    htmlTemplate = htmlTemplate.replace("{{TOTAL_AMOUNT}}", `$${order.total.toFixed(2)}`);

    // 3. Send email asynchronously without blocking
    const subject = `Order Confirmed — Order #${order._id}`;
    
    // We do NOT await this in the main thread if we don't want to block,
    // or we await it but catch errors safely.
    await emailService.sendEmail({
      to: customer.email,
      subject,
      html: htmlTemplate,
    });

  } catch (error) {
    console.error("[NOTIFICATION SERVICE ERROR] Order confirmation email failed:", error);
    // Crucial Rule: Do NOT throw here. 
    // If notification fails, the order is still valid in the DB.
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
