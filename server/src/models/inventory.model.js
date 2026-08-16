const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    unit: {
      type: String,
      required: true, // e.g. "kg", "grams", "liters", "units"
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Stock Transactions (Auditing)
const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        "PURCHASE",
        "SALE",
        "WASTAGE",
        "ADJUSTMENT",
        "TRANSFER_IN",
        "TRANSFER_OUT",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    remarks: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);
const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);

module.exports = { InventoryItem, InventoryTransaction };
