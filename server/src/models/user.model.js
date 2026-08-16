const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ORGANIZATION_OWNER",
        "FRANCHISE_OWNER",
        "RESTAURANT_ADMIN",
        "MANAGER",
        "CASHIER",
        "WAITER",
        "KITCHEN_STAFF",
        "INVENTORY_MANAGER",
        "ACCOUNTANT",
      ],
      default: "CASHIER",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, organization: this.organization, restaurant: this.restaurant },
    process.env.JWT_SECRET || "dineops_super_secret_key_2026",
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
