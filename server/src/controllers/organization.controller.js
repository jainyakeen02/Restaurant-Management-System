const Organization = require("../models/organization");

const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await Organization.find();
    res.status(200).json({
      success: true,
      count: orgs.length,
      data: orgs,
    });
  } catch (error) {
    next(error);
  }
};

const getOrganizationById = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }
    res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
};
