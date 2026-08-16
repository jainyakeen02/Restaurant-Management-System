const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    floor: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "OUT_OF_SERVICE"],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate table numbers in the same restaurant
tableSchema.index({ tableNumber: 1, restaurant: 1 }, { unique: true });

const Table = mongoose.model("Table", tableSchema);
module.exports = Table;
