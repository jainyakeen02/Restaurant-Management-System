const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
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
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "19:30"
      required: true,
    },
    partySize: {
      type: Number,
      required: true,
      min: 1,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "PENDING",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Prevent double booking for the same table at the same time
reservationSchema.index({ restaurant: 1, table: 1, date: 1, time: 1 }, { unique: true });

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
