const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true }, // Price snapshot
  totalPrice: { type: Number, required: true }, // quantity * unitPrice
  notes: String,
  status: {
    type: String,
    enum: ["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"],
    default: "PENDING",
  },
});

const orderSchema = new mongoose.Schema(
  {
    // Bill number: BRANCHCODE-YYYYMMDD-NNN (e.g. SGROAD001-20260818-001)
    billNumber: {
      type: String,
      unique: true,
      sparse: true, // allows null while being unique
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false, // Optional — branches operate independently
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    // Walk-in customer details (for billing desk orders)
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    orderType: {
      type: String,
      enum: ["DINE_IN", "TAKEAWAY", "DELIVERY"],
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 5 }, // percentage
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "SERVED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID", "REFUNDED"],
      default: "UNPAID",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "ONLINE"],
    },
    deliveryAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true },
    },
    deliveryNotes: { type: String, trim: true },
    estimatedDeliveryTime: { type: Date },
    deliveryDriver: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    whatsappSent: { type: Boolean, default: false },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

