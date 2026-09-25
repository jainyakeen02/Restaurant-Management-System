const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const Organization = require("../models/organization");
const Restaurant = require("../models/restaurant");

// Helper to generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      restaurant: user.restaurant,
    },
  });
};

const { sendWhatsAppMessage } = require("../services/whatsapp.service");
const { sendEmail } = require("../services/email.service");
const crypto = require("crypto");

const register = async (req, res, next) => {
  try {
    let { name, email, password, role, organization, restaurant, phone } = req.body;

    // SECURITY: Prevent public SUPER_ADMIN creation
    if (role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cannot register as SUPER_ADMIN via public endpoints.",
      });
    }

    // SECURITY: Org/Branch owners are provisioned by Super Admin — no self-registration
    if (role === "ORGANIZATION_OWNER" || role === "FRANCHISE_OWNER") {
      return res.status(403).json({
        success: false,
        message:
          "Organisation and Branch Owners cannot self-register. Please use the Owner Portal to log in with your Name and Code provided by your Super Admin.",
      });
    }

    // Default role if none provided
    if (!role) {
      role = "CUSTOMER";
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : "";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already registered with another account.",
        });
      }
    }

    const user = await User.create({
      name: name?.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || undefined,
      role,
      organization,
      restaurant,
    });

    if (phone && role === "CUSTOMER") {
      const welcomeMessage = `Welcome to DineOps, ${name}! 🎉 We're excited to have you on board. Start ordering from your favorite branches today.`;
      await sendWhatsAppMessage(phone, welcomeMessage);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Customer Registration — creates record in Customer collection
 * @route  POST /api/auth/customer/register
 * @access Public
 */
const customerRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name, password, and email or phone number.",
      });
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;

    if (normalizedEmail) {
      const existingCustomer = await Customer.findOne({ email: normalizedEmail });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists. Please sign in instead.",
        });
      }
    }

    if (cleanPhone) {
      const existingPhone = await Customer.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "An account with this phone number already exists. Please sign in instead.",
        });
      }
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanPhone || "",
      password,
    });

    if (cleanPhone) {
      const welcomeMessage = `Welcome to DineOps, ${name}! 🎉 We're excited to have you on board. Start ordering from your favorite branches today.`;
      await sendWhatsAppMessage(cleanPhone, welcomeMessage);
    }

    const token = customer.getSignedJwtToken();
    res.status(201).json({
      success: true,
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Customer Login — authenticates against Customer collection
 * @route  POST /api/auth/customer/login
 * @access Public
 */
const customerLogin = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginInput = (identifier || email || phone || "").trim();

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email/phone and password.",
      });
    }

    const normalizedEmail = loginInput.toLowerCase();
    const digitsOnly = loginInput.replace(/\D/g, "");
    const last10 = digitsOnly.slice(-10);

    let customer = await Customer.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: loginInput },
        ...(last10 ? [{ phone: last10 }, { phone: "0" + last10 }, { phone: "+91" + last10 }] : []),
      ],
    }).select("+password");

    // Fallback: If not found in Customer collection, check legacy User collection
    if (!customer) {
      const legacyUser = await User.findOne({
        email: normalizedEmail,
        role: "CUSTOMER",
      }).select("+password");

      if (legacyUser) {
        const isMatch = await legacyUser.matchPassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        return sendTokenResponse(legacyUser, 200, res);
      }

      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (customer.status !== "active") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    const token = customer.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Admin Portal Login — strictly for SUPER_ADMIN & ORGANIZATION_OWNER
 * @route  POST /api/auth/admin/login
 * @access Public
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an admin email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    // Only allow admin roles
    const adminRoles = ["SUPER_ADMIN", "ORGANIZATION_OWNER"];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This login section is strictly for system administrators.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Owner Portal Login — authenticate using Name + Code
 *         Matches against Organisation (ORGANIZATION_OWNER) or Restaurant (FRANCHISE_OWNER).
 *         On first login, a User record is auto-created and linked to the entity (Option A).
 * @route  POST /api/auth/owner-login
 * @access Public
 */
const ownerLogin = async (req, res, next) => {
  try {
    const { name, code, ownerType } = req.body;

    if (!name || !code || !ownerType) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, code, and owner type.",
      });
    }

    if (!["organization", "branch"].includes(ownerType)) {
      return res.status(400).json({
        success: false,
        message: "ownerType must be 'organization' or 'branch'.",
      });
    }

    const isOrg = ownerType === "organization";

    // --- 1. Verify credentials against the entity ---
    let entity;
    if (isOrg) {
      entity = await Organization.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        code: code.trim().toUpperCase(),
        status: "active",
      });
    } else {
      entity = await Restaurant.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        code: code.trim().toUpperCase(),
        status: "active",
      });
    }

    if (!entity) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Name and Code do not match any active record.",
      });
    }

    // --- 2. Find or auto-create the owner User record (Option A) ---
    const role = isOrg ? "ORGANIZATION_OWNER" : "FRANCHISE_OWNER";
    const entityField = isOrg ? "organization" : "restaurant";

    let user = await User.findOne({ [entityField]: entity._id, role });

    if (!user) {
      // First-time login: auto-create the owner user account
      // Use a generated email and a strong random password (owner never uses email+pw to login)
      const autoEmail = `owner_${entity.code.toLowerCase()}@dineops.internal`;
      const autoPassword = `${entity.code}_${entity._id}_owner_${Date.now()}`;

      user = await User.create({
        name: entity.name,
        email: autoEmail,
        password: autoPassword,
        role,
        [entityField]: entity._id,
        status: "active",
      });

      // Link the owner back to the entity
      entity.owner = user._id;
      await entity.save();
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This owner account has been suspended. Contact Super Admin.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Please provide a registered phone number or email" });
    }

    let user;
    if (phone) {
      const rawPhone = phone.trim();
      const digitsOnly = rawPhone.replace(/\D/g, "");
      const last10 = digitsOnly.slice(-10);

      const phoneQuery = {
        $or: [
          { phone: rawPhone },
          { phone: digitsOnly },
          { phone: last10 },
          { phone: "0" + last10 },
          { phone: "+91" + last10 },
          { phone: "91" + last10 },
        ],
      };

      // Check Customer collection first, then User collection
      user = await Customer.findOne(phoneQuery);
      if (!user) {
        user = await User.findOne(phoneQuery);
      }
    }

    if (!user && email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await Customer.findOne({ email: normalizedEmail });
      if (!user) {
        user = await User.findOne({ email: normalizedEmail });
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "There is no account registered with that phone number or email." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Determine client frontend URL
    const clientUrl = process.env.CLIENT_URL || req.headers.origin || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You requested a password reset for DineOps. Please click this link to reset your password: \n\n ${resetUrl}`;

    // Generate 100% Free WhatsApp Direct Click-to-Chat Link (wa.me)
    let whatsappUrl = null;
    const phoneToUse = (user.phone || phone || "").replace(/\D/g, "");
    if (phoneToUse && phoneToUse.length >= 10) {
      const normalizedPhone = phoneToUse.startsWith("91") ? phoneToUse : `91${phoneToUse.slice(-10)}`;
      const whatsappLines = [
        `🔐 *DineOps Password Set / Reset*`,
        ``,
        `Hello ${user.name || "there"},`,
        `You requested to set or reset your password for your DineOps account.`,
        ``,
        `👉 Click here to set your password:`,
        `${resetUrl}`,
        ``,
        `⏰ _This link is valid for 10 minutes._`,
      ].join("\n");

      whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappLines)}`;
    }

    try {
      // If user has a phone, send WhatsApp (or log via simulator)
      if (user.phone) {
        await sendWhatsAppMessage(user.phone, message);
      }

      // If user has an email, dispatch EmailJS (if configured on backend)
      if (user.email) {
        await sendEmail({
          toEmail: user.email,
          toName: user.name,
          resetUrl,
        });
      }

      res.status(200).json({
        success: true,
        message: "Password reset link generated successfully",
        whatsappUrl,
        phone: user.phone || phone || null,
        email: user.email || null,
        name: user.name || "User",
        resetUrl,
        resetToken,
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Password reset request could not be completed" });
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    let isCustomerRecord = false;
    if (!user) {
      user = await Customer.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (user) isCustomerRecord = true;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    if (isCustomerRecord) {
      const token = user.getSignedJwtToken();
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: "CUSTOMER",
        },
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  customerRegister,
  customerLogin,
  adminLogin,
  ownerLogin,
  forgotPassword,
  resetPassword,
};

