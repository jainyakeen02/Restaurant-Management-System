const { MenuCategory, MenuItem } = require("../models/menu.model");
const Order = require("../models/order.model");
const Restaurant = require("../models/restaurant");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate bill number: BRANCHCODE-YYYYMMDD-NNN
 * Serial number resets daily and is derived by counting existing bills for today.
 */
const generateBillNumber = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId).select("code");
  const branchCode = restaurant?.code || "BRANCH";

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Count how many bills exist for this branch today
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayCount = await Order.countDocuments({
    restaurant: restaurantId,
    billNumber: { $exists: true, $ne: null },
    createdAt: { $gte: dayStart, $lt: dayEnd },
  });

  const serial = String(todayCount + 1).padStart(3, "0");
  return `${branchCode}-${dateStr}-${serial}`;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc  Get menu (categories + items) for the branch POS
 *        Returns items that belong to this branch OR have no branch assigned (platform-wide)
 * @route GET /api/billing/menu
 * @access FRANCHISE_OWNER
 */
const getMenuForBranch = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant;

    // Fetch active categories
    const categories = await MenuCategory.find({ status: "active" })
      .sort("sortOrder name")
      .lean();

    // Fetch items: belonging to this branch OR platform-wide (no restaurant set)
    const items = await MenuItem.find({
      status: "active",
      availability: true,
      $or: [
        { restaurant: restaurantId },
        { restaurant: { $exists: false } },
        { restaurant: null },
      ],
    })
      .populate("category", "name")
      .sort("name")
      .lean();

    // Group items by category
    const grouped = categories
      .map((cat) => ({
        ...cat,
        items: items.filter(
          (item) => item.category?._id?.toString() === cat._id.toString()
        ),
      }))
      .filter((cat) => cat.items.length > 0); // Only show categories that have items

    res.status(200).json({
      success: true,
      data: { categories: grouped, totalItems: items.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Create a walk-in order from the billing desk
 * @route POST /api/billing/orders
 * @access FRANCHISE_OWNER
 */
const createWalkInOrder = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant;
    const {
      items,           // [{ menuItemId, name, quantity, unitPrice }]
      orderType,       // DINE_IN | TAKEAWAY | DELIVERY
      customerName,
      customerPhone,
      discount = 0,
      taxRate = 5,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must have at least one item." });
    }

    // Build order items with price snapshot
    const orderItems = items.map((item) => ({
      menuItem:   item.menuItemId,
      name:       item.name,
      quantity:   item.quantity,
      unitPrice:  item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal  = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxAmount = Math.round(((subtotal - discount) * taxRate) / 100);
    const total     = subtotal - discount + taxAmount;

    const billNumber = await generateBillNumber(restaurantId);

    const order = await Order.create({
      billNumber,
      restaurant:    restaurantId,
      customerName:  customerName || "Walk-in Customer",
      customerPhone: customerPhone || null,
      orderType:     orderType || "DINE_IN",
      items:         orderItems,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      total,
      notes,
      orderStatus:   "PENDING",
      paymentStatus: "UNPAID",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get all orders for this branch (filterable by status)
 * @route GET /api/billing/orders
 * @access FRANCHISE_OWNER
 */
const getBranchOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant;
    const { status, date } = req.query;

    const filter = { restaurant: restaurantId };

    if (status && status !== "ALL") {
      filter.orderStatus = status;
    }

    // Filter by date (default: today)
    if (date) {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end   = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: start, $lt: end };
    } else {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end   = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update order status (Confirm → Preparing → Ready → Served → Completed)
 * @route PATCH /api/billing/orders/:id/status
 * @access FRANCHISE_OWNER
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ["CONFIRMED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"];

    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurant },
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Mark order as paid and return WhatsApp bill URL
 * @route PATCH /api/billing/orders/:id/pay
 * @access FRANCHISE_OWNER
 */
const markOrderPaid = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurant },
      {
        paymentStatus:  "PAID",
        paymentMethod:  paymentMethod || "CASH",
        orderStatus:    "COMPLETED",
        whatsappSent:   false,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Build WhatsApp click-to-chat message
    let whatsappUrl = null;
    const phone = order.customerPhone?.replace(/\D/g, "");
    if (phone && phone.length >= 10) {
      const normalizedPhone = phone.startsWith("91") ? phone : `91${phone}`;
      const billLines = [
        `🍽️ *DineOps Bill*`,
        `Bill No: ${order.billNumber}`,
        `──────────────────`,
        ...order.items.map(
          (i) => `${i.name} x${i.quantity} = ₹${i.totalPrice}`
        ),
        `──────────────────`,
        `Subtotal: ₹${order.subtotal}`,
        order.discount > 0 ? `Discount: -₹${order.discount}` : null,
        `Tax (${order.taxRate}%): ₹${order.taxAmount}`,
        `*Total: ₹${order.total}*`,
        `Payment: ${paymentMethod || "CASH"}`,
        ``,
        `Thank you for dining with us! 🙏`,
      ]
        .filter(Boolean)
        .join("\n");

      whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(billLines)}`;

      // Mark as sent
      await Order.findByIdAndUpdate(order._id, { whatsappSent: true });
    }

    res.status(200).json({
      success: true,
      message: "Order marked as paid.",
      data: order,
      whatsappUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get kitchen view — active orders (PENDING, CONFIRMED, PREPARING, READY)
 * @route GET /api/billing/kitchen
 * @access FRANCHISE_OWNER
 */
const getKitchenOrders = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant;

    const orders = await Order.find({
      restaurant: restaurantId,
      orderStatus: { $in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
    })
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .lean();

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuForBranch,
  createWalkInOrder,
  getBranchOrders,
  updateOrderStatus,
  markOrderPaid,
  getKitchenOrders,
};
