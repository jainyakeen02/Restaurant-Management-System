const Order = require("../models/order.model");
const Restaurant = require("../models/restaurant");

/**
 * Helper to generate unique bill / order number
 */
const generateBillNumber = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId).select("code");
  const branchCode = restaurant?.code || "DINE";

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayCount = await Order.countDocuments({
    restaurant: restaurantId,
    billNumber: { $exists: true, $ne: null },
    createdAt: { $gte: dayStart, $lt: dayEnd },
  });

  const serial = String(todayCount + 1).padStart(3, "0");
  return `${branchCode}-${dateStr}-${serial}`;
};

/**
 * @desc   Place customer order (Online / Specific Restaurant)
 * @route  POST /api/orders
 * @access Public / Customer
 */
const createCustomerOrder = async (req, res, next) => {
  try {
    const {
      restaurant: restaurantId,
      items,
      orderType = "DELIVERY",
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryNotes,
      notes,
      paymentMethod = "ONLINE",
    } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Please specify a restaurant branch." });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Selected restaurant branch was not found." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Your order must contain at least one item." });
    }

    // Process order items snapshot
    const orderItems = items.map((item) => {
      const unitPrice = Number(item.price || item.unitPrice || 0);
      const quantity = Math.max(1, Number(item.quantity || 1));
      return {
        menuItem: item.id || item.menuItemId || item.menuItem,
        name: item.name,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        notes: item.notes || "",
        status: "PENDING",
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxRate = 5; // 5% GST
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + taxAmount;

    const billNumber = await generateBillNumber(restaurantId);

    // Compute estimated delivery/preparation time (35 mins for delivery, 20 mins for dine-in/takeaway)
    const prepMinutes = orderType === "DELIVERY" ? 35 : 20;
    const estimatedDeliveryTime = new Date(Date.now() + prepMinutes * 60 * 1000);

    // Customer association if user is logged in
    const customerId = req.user?.isCustomer || req.user?.role === "CUSTOMER" ? req.user._id : undefined;

    const order = await Order.create({
      billNumber,
      restaurant: restaurantId,
      customer: customerId,
      customerName: customerName || req.user?.name || "Online Customer",
      customerPhone: customerPhone || req.user?.phone || "",
      orderType: ["DELIVERY", "TAKEAWAY", "DINE_IN"].includes(orderType) ? orderType : "DELIVERY",
      items: orderItems,
      subtotal,
      discount: 0,
      taxRate,
      taxAmount,
      total,
      orderStatus: "PENDING",
      paymentStatus: paymentMethod === "CASH" ? "UNPAID" : "PAID",
      paymentMethod: ["CASH", "CARD", "UPI", "ONLINE"].includes(paymentMethod) ? paymentMethod : "ONLINE",
      deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : undefined,
      deliveryNotes: deliveryNotes || "",
      notes: notes || "",
      estimatedDeliveryTime,
    });

    await order.populate("restaurant", "name code address contact email");

    // Build tracking URL
    const clientUrl = process.env.CLIENT_URL || req.headers.origin || "http://localhost:5173";
    const trackingUrl = `${clientUrl}/track-order/${order._id}`;

    // Generate WhatsApp confirmation link for the customer
    let whatsappUrl = null;
    const phoneToUse = (customerPhone || req.user?.phone || "").replace(/\D/g, "");
    if (phoneToUse && phoneToUse.length >= 10) {
      const normalizedPhone = phoneToUse.startsWith("91") ? phoneToUse : `91${phoneToUse.slice(-10)}`;
      const lines = [
        `🍽️ *DineOps Order Confirmation*`,
        `Order Ref: #${order.billNumber}`,
        `Branch: ${restaurant.name}`,
        `Status: Placed (Preparing soon)`,
        `Total: ₹${order.total}`,
        ``,
        `📍 Track your delivery live:`,
        `${trackingUrl}`,
        ``,
        `Thank you for ordering with DineOps!`,
      ].join("\n");
      whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(lines)}`;
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
      trackingUrl,
      whatsappUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Track order by Order ID or Bill Number
 * @route  GET /api/orders/track/:id
 * @route  GET /api/orders/:id
 * @access Public / Customer
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id)
        .populate("restaurant", "name code address contact phone email logo image")
        .populate("customer", "name email phone");
    } else {
      order = await Order.findOne({ billNumber: id })
        .populate("restaurant", "name code address contact phone email logo image")
        .populate("customer", "name email phone");
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Determine tracking steps based on orderType
    const isDelivery = order.orderType === "DELIVERY";

    const steps = isDelivery
      ? [
          { key: "PENDING", title: "Order Placed", desc: "Your order has been received by the restaurant." },
          { key: "CONFIRMED", title: "Order Confirmed", desc: "The kitchen has accepted your order." },
          { key: "PREPARING", title: "Kitchen Preparing", desc: "Chef is freshly preparing your dishes." },
          { key: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Delivery partner is on the way to your location." },
          { key: "DELIVERED", title: "Delivered", desc: "Your meal has been delivered. Enjoy!" },
        ]
      : [
          { key: "PENDING", title: "Order Placed", desc: "Your order has been received by the restaurant." },
          { key: "CONFIRMED", title: "Order Confirmed", desc: "The kitchen has accepted your order." },
          { key: "PREPARING", title: "Kitchen Preparing", desc: "Chef is freshly preparing your dishes." },
          { key: "READY", title: "Ready for Pickup / Serve", desc: "Your food is ready at the counter or table." },
          { key: "COMPLETED", title: "Completed / Served", desc: "Order completed. Thank you!" },
        ];

    // Status map to step index
    const statusIndices = isDelivery
      ? {
          PENDING: 0,
          CONFIRMED: 1,
          PREPARING: 2,
          READY: 2, // ready waiting for driver
          OUT_FOR_DELIVERY: 3,
          DELIVERED: 4,
          COMPLETED: 4,
          CANCELLED: -1,
        }
      : {
          PENDING: 0,
          CONFIRMED: 1,
          PREPARING: 2,
          READY: 3,
          SERVED: 4,
          COMPLETED: 4,
          CANCELLED: -1,
        };

    const currentStep = statusIndices[order.orderStatus] !== undefined ? statusIndices[order.orderStatus] : 0;

    res.status(200).json({
      success: true,
      data: order,
      steps,
      currentStep,
      isCancelled: order.orderStatus === "CANCELLED",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get logged in customer's order history
 * @route  GET /api/orders/my-orders
 * @access Customer
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userPhone = req.user.phone;

    const query = {
      $or: [
        { customer: userId },
        ...(userPhone ? [{ customerPhone: userPhone }] : []),
      ],
    };

    const orders = await Order.find(query)
      .populate("restaurant", "name code address contact phone")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all orders (Admin / Franchise POS list)
 * @route  GET /api/orders
 * @access SUPER_ADMIN, ORGANIZATION_OWNER, FRANCHISE_OWNER
 */
const getAllOrders = async (req, res, next) => {
  try {
    const filter = {};

    // Franchise owner only sees their branch orders
    if (req.user?.role === "FRANCHISE_OWNER") {
      filter.restaurant = req.user.restaurant;
    } else if (req.query.restaurant) {
      filter.restaurant = req.query.restaurant;
    }

    if (req.query.status && req.query.status !== "ALL") {
      filter.orderStatus = req.query.status;
    }

    if (req.query.orderType) {
      filter.orderType = req.query.orderType;
    }

    const orders = await Order.find(filter)
      .populate("restaurant", "name code address")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update order status & delivery details
 * @route  PATCH /api/orders/:id/status
 * @access FRANCHISE_OWNER, RESTAURANT_ADMIN, SUPER_ADMIN
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, deliveryDriver, estimatedDeliveryTime } = req.body;

    const VALID_STATUSES = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "SERVED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const updateFields = {};
    if (status) updateFields.orderStatus = status;
    if (deliveryDriver) updateFields.deliveryDriver = deliveryDriver;
    if (estimatedDeliveryTime) updateFields.estimatedDeliveryTime = estimatedDeliveryTime;

    const query = { _id: req.params.id };
    if (req.user?.role === "FRANCHISE_OWNER") {
      query.restaurant = req.user.restaurant;
    }

    const order = await Order.findOneAndUpdate(query, updateFields, { new: true })
      .populate("restaurant", "name code address contact phone")
      .populate("customer", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${order.orderStatus}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomerOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
