const User = require("../models/user.model");
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

const register = async (req, res, next) => {
  try {
    let { name, email, password, role, organization, restaurant } = req.body;

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

    const user = await User.create({
      name,
      email,
      password,
      role,
      organization,
      restaurant,
    });

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

    const user = await User.findOne({ email }).select("+password");

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

module.exports = {
  register,
  login,
  ownerLogin,
};

