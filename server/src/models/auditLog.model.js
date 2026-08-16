const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'ORDER_CREATED', 'PAYMENT_UPDATED'
    },
    entity: {
      type: String,
      required: true, // e.g., 'Order', 'Payment', 'User'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
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
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Stores changes, old values, new values
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;
