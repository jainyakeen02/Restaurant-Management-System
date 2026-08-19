const User = require("../models/user.model");
const Restaurant = require("../models/restaurant");
const Order = require("../models/order.model");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const startOfDay = (d) => { const r = new Date(d); r.setHours(0,0,0,0); return r; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);

/**
 * @desc  Get all platform-wide stats (Super Admin only)
 * @route GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalBranches,
      activeBranches,
      totalUsers,
      totalOrders,
      revenueData,
      recentOrders,
      branchOwners,
    ] = await Promise.all([
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: "SUPER_ADMIN" } }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $in: ["COMPLETED", "SERVED"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("restaurant", "name"),
      User.find({ role: "FRANCHISE_OWNER" })
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: { $in: ["COMPLETED", "SERVED"] },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartData = monthlyRevenue.map((d) => ({
      name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      Revenue: Math.round(d.revenue),
      Orders: d.orders,
    }));

    res.status(200).json({
      success: true,
      data: { summary: { totalBranches, activeBranches, totalUsers, totalOrders, totalRevenue }, chartData, recentOrders, branchOwners },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get rich analytics for a single branch (FRANCHISE_OWNER)
 * @route GET /api/admin/branch-stats
 */
const getBranchStats = async (req, res, next) => {
  try {
    const restaurantId = req.user.restaurant;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "No branch linked to this account." });
    }

    const now = new Date();
    const todayStart  = startOfDay(now);
    const monthStart  = startOfMonth(now);
    const yearStart   = startOfYear(now);

    const baseFilter       = { restaurant: restaurantId };
    const completedFilter  = { ...baseFilter, orderStatus: { $in: ["COMPLETED", "SERVED"] } };

    const [
      // --- All-time totals ---
      totalOrders,
      revenueAgg,
      // --- Today ---
      todayOrders,
      todayRevenueAgg,
      todayCustomers,
      // --- This month ---
      monthOrders,
      monthRevenueAgg,
      // --- This year ---
      yearOrders,
      yearRevenueAgg,
      // --- Pending / active orders ---
      pendingOrders,
      // --- Recent orders feed ---
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(baseFilter),
      Order.aggregate([{ $match: completedFilter }, { $group: { _id: null, total: { $sum: "$total" } } }]),

      Order.countDocuments({ ...baseFilter, createdAt: { $gte: todayStart } }),
      Order.aggregate([{ $match: { ...completedFilter, createdAt: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.distinct("customer", { ...baseFilter, createdAt: { $gte: todayStart }, customer: { $ne: null } }),

      Order.countDocuments({ ...baseFilter, createdAt: { $gte: monthStart } }),
      Order.aggregate([{ $match: { ...completedFilter, createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),

      Order.countDocuments({ ...baseFilter, createdAt: { $gte: yearStart } }),
      Order.aggregate([{ $match: { ...completedFilter, createdAt: { $gte: yearStart } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),

      Order.countDocuments({ ...baseFilter, orderStatus: { $in: ["PENDING", "CONFIRMED", "PREPARING"] } }),

      Order.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderType orderStatus paymentStatus total createdAt items")
        .lean(),
    ]);

    // --- Unique customers total (all-time) ---
    const uniqueCustomers = await Order.distinct("customer", { ...baseFilter, customer: { $ne: null } });

    // --- Monthly trend (last 6 months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Order.aggregate([
      { $match: { ...completedFilter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // --- Daily trend (last 30 days) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await Order.aggregate([
      { $match: { ...completedFilter, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // --- Yearly trend (last 3 years) ---
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const yearlyTrend = await Order.aggregate([
      { $match: { ...completedFilter, createdAt: { $gte: threeYearsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    // --- Top 5 selling items ---
    const topItems = await Order.aggregate([
      { $match: { ...baseFilter, orderStatus: { $nin: ["CANCELLED"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // --- Order type breakdown ---
    const orderTypeBreakdown = await Order.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$orderType", count: { $sum: 1 } } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue:       revenueAgg[0]?.total || 0,
          totalOrders,
          totalCustomers:     uniqueCustomers.length,
          pendingOrders,
          // Today
          todayRevenue:       todayRevenueAgg[0]?.total || 0,
          todayOrders,
          todayCustomers:     todayCustomers.length,
          // Month
          monthRevenue:       monthRevenueAgg[0]?.total || 0,
          monthOrders,
          // Year
          yearRevenue:        yearRevenueAgg[0]?.total || 0,
          yearOrders,
        },
        monthlyChart: monthlyTrend.map((d) => ({
          name: `${monthNames[d._id.month - 1]} '${String(d._id.year).slice(2)}`,
          Revenue: Math.round(d.revenue),
          Orders: d.orders,
        })),
        dailyChart: dailyTrend.map((d) => ({
          name: `${d._id.day} ${monthNames[d._id.month - 1]}`,
          Revenue: Math.round(d.revenue),
          Orders: d.orders,
        })),
        yearlyChart: yearlyTrend.map((d) => ({
          name: String(d._id.year),
          Revenue: Math.round(d.revenue),
          Orders: d.orders,
        })),
        topItems,
        orderTypeBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminStats, getBranchStats };


