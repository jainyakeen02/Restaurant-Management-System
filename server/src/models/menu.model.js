const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    variants: [
      {
        name: String, // e.g., "Small", "Medium", "Large"
        additionalPrice: { type: Number, default: 0 },
      },
    ],
    modifiers: [
      {
        name: String, // e.g., "Extra Cheese"
        price: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const MenuCategory = mongoose.model("MenuCategory", menuCategorySchema);
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = { MenuCategory, MenuItem };
