const Booking = require("../models/Booking");
const Service = require("../models/Service");
const User = require("../models/User");

// Get booking analytics for admin dashboard
const getBookingAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Bookings per day for the last N days
    const bookingsByDay = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Total bookings in period
    const totalBookings = await Booking.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: startDate }
    });
    
    // Total revenue in period
    const revenueResult = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    // Average booking value
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    
    // Popular services (based on booking count)
    const popularServices = await Booking.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: startDate } } },
      { $unwind: "$services" },
      {
        $group: {
          _id: "$services",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Customer stats
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newCustomers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: startDate }
    });
    
    res.status(200).json({
      period: daysAgo,
      totalBookings,
      totalRevenue,
      avgBookingValue,
      bookingsByDay,
      popularServices,
      statusBreakdown,
      totalCustomers,
      newCustomers
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

// Get revenue by service
const getRevenueByService = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    const revenueByService = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: "$services" },
      {
        $group: {
          _id: "$services",
          totalRevenue: { $sum: "$totalAmount" },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    res.status(200).json(revenueByService);
  } catch (error) {
    console.error("Get revenue by service error:", error);
    res.status(500).json({
      message: "Failed to fetch revenue data",
      error: error.message
    });
  }
};

// Get monthly comparisons
const getMonthlyStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Current month stats
    const currentMonthBookings = await Booking.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: currentMonthStart }
    });
    
    const currentMonthRevenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueResult[0]?.revenue || 0;
    
    // Last month stats
    const lastMonthBookings = await Booking.countDocuments({
      status: 'confirmed',
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    
    const lastMonthRevenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueResult[0]?.revenue || 0;
    
    // Calculate growth
    const bookingsGrowth = lastMonthBookings > 0 
      ? Math.round(((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100) 
      : 0;
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
      : 0;
    
    res.status(200).json({
      currentMonth: {
        bookings: currentMonthBookings,
        revenue: currentMonthRevenue
      },
      lastMonth: {
        bookings: lastMonthBookings,
        revenue: lastMonthRevenue
      },
      growth: {
        bookings: bookingsGrowth,
        revenue: revenueGrowth
      }
    });
  } catch (error) {
    console.error("Get monthly stats error:", error);
    res.status(500).json({
      message: "Failed to fetch monthly stats",
      error: error.message
    });
  }
};

module.exports = {
  getBookingAnalytics,
  getRevenueByService,
  getMonthlyStats
};
