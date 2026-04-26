const Booking = require("../models/Booking");

const createBooking = async (req, res) => {
  try {
    const {
      name,
      phone,
      services,
      date,
      time,
      notes,
      appointmentDate,
      appointmentTime
    } = req.body;

    const finalDate = appointmentDate || date;
    const finalTime = appointmentTime || time;

    if (!services || !services.length || !finalDate || !finalTime) {
      return res.status(400).json({
        message: "Services, appointment date and appointment time are required"
      });
    }

    const totalAmount = Array.isArray(services)
      ? services.reduce((sum, service) => {
          if (typeof service === "object" && service.price) {
            return sum + Number(service.price);
          }
          return sum + 200;
        }, 0)
      : 0;

    const booking = await Booking.create({
      name: name || "",
      phone: phone || "",
      services,
      appointmentDate: finalDate,
      appointmentTime: finalTime,
      notes: notes || "",
      totalAmount,
      userId: req.user.id
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 }).populate('userId', 'name');
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      appointmentDate: { 
        $gte: today.toISOString().split('T')[0],
        $lt: tomorrow.toISOString().split('T')[0]
      }
    });
    
    const revenueResult = await Booking.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    
    const expectedRevenue = revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      totalBookings,
      todayBookings,
      expectedRevenue
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message
    });
  }
};

const getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email phone');
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get recent bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch recent bookings",
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getAdminStats,
  getRecentBookings
};
