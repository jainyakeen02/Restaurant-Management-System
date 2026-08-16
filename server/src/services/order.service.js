const Order = require("../models/order.model");
const { MenuItem } = require("../models/menu.model");
const notificationService = require("./notification.service");

const processNewOrder = async (orderData, customerData, restaurantData) => {
  // 1. Validate Prices against DB (Critical Price Rule)
  let calculatedSubtotal = 0;
  const processedItems = [];

  for (const item of orderData.items) {
    const dbMenuItem = await MenuItem.findById(item.menuItem);
    if (!dbMenuItem) {
      throw new Error(`Menu item ${item.menuItem} not found`);
    }

    const unitPrice = dbMenuItem.price;
    const totalPrice = unitPrice * item.quantity;
    
    calculatedSubtotal += totalPrice;

    processedItems.push({
      menuItem: dbMenuItem._id,
      name: dbMenuItem.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // 2. Calculate final totals
  const discount = orderData.discount || 0;
  const finalTotal = calculatedSubtotal - discount;

  // 3. Create the Order in DB
  const newOrder = await Order.create({
    organization: orderData.organization,
    restaurant: orderData.restaurant,
    customer: orderData.customer,
    table: orderData.table,
    orderType: orderData.orderType,
    items: processedItems,
    subtotal: calculatedSubtotal,
    discount,
    total: finalTotal,
  });

  // 4. Trigger asynchronous notification (DO NOT AWAIT or AWAIT SAFELY)
  if (customerData && customerData.email) {
    // Fire and forget so order creation is fast and resilient
    notificationService.sendOrderConfirmationEmail(newOrder, customerData, restaurantData)
      .catch(err => console.error("Async notification failed", err));
  }

  return newOrder;
};

module.exports = {
  processNewOrder,
};
