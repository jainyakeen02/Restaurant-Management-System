const { MenuCategory, MenuItem } = require("../models/menu.model");
const Restaurant = require("../models/restaurant");

// ─── Menu Categories ──────────────────────────────────────────────────────────

const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuCategory.find({ status: "active" })
      .populate("restaurant", "name")
      .sort("sortOrder");
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) { next(error); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, organization, restaurant, sortOrder } = req.body;
    const data = { name, description, restaurant, sortOrder };
    if (organization && organization !== '') data.organization = organization;
    const category = await MenuCategory.create(data);
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) { next(error); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(req.params.id, { status: "inactive" }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category removed" });
  } catch (error) { next(error); }
};

// ─── Menu Items ───────────────────────────────────────────────────────────────

const getMenuItems = async (req, res, next) => {
  try {
    const filter = { status: "active" };
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    if (req.query.category) filter.category = req.query.category;

    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .populate("restaurant", "name")
      .sort("name");
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
};

const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, category, price, organization, restaurant, variants, modifiers } = req.body;
    const data = { name, description, category, price, variants, modifiers };
    if (organization && organization !== '') data.organization = organization;
    if (restaurant && restaurant !== '') data.restaurant = restaurant;
    const item = await MenuItem.create(data);
    const populated = await MenuItem.findById(item._id).populate("category", "name").populate("restaurant", "name");
    res.status(201).json({ success: true, message: "Menu item created", data: populated });
  } catch (error) { next(error); }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("category", "name").populate("restaurant", "name");
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, message: "Menu item updated", data: item });
  } catch (error) { next(error); }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, { status: "inactive" }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, message: "Menu item removed" });
  } catch (error) { next(error); }
};

module.exports = { getCategories, createCategory, deleteCategory, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem };
