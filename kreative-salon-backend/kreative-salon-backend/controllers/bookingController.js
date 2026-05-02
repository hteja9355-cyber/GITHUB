const Booking = require("../models/Booking");
const User = require("../models/User");
const {
  sendBookingRequestEmail,
  sendBookingConfirmedEmail,
  sendNewBookingNotification
} = require("../services/emailService");

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

    const totalAmount = req.body.totalAmount !== undefined
      ? Number(req.body.totalAmount)
      : Array.isArray(services)
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

    // Get user email for sending confirmation
    const user = await User.findById(req.user.id);
    
    // Send email to customer about their booking request
    if (user && user.email) {
      sendBookingRequestEmail(user.email, user.name, {
        services,
        appointmentDate: finalDate,
        appointmentTime: finalTime,
        totalAmount
      });
    }

    // Send notification to admin about new booking request
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser && adminUser.email) {
      sendNewBookingNotification(adminUser.email, {
        name: name || user.name,
        phone: phone || "",
        services,
        appointmentDate: finalDate,
        appointmentTime: finalTime,
        notes: notes || ""
      });
    }

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
    const pad = n => n < 10 ? '0' + n : n;
    const d = new Date();
    const localToday = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const todayBookings = await Booking.countDocuments({
      status: 'confirmed',
      appointmentDate: localToday
    });
    
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
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

// Get pending booking requests (for admin)
const getPendingRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      message: "Failed to fetch pending requests",
      error: error.message
    });
  }
};

// Confirm/Approve a booking request
const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id).populate('userId', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    // Send confirmation email to customer
    if (booking.userId && booking.userId.email) {
      sendBookingConfirmedEmail(booking.userId.email, booking.userId.name, {
        services: booking.services,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        totalAmount: booking.totalAmount
      });
    }
    
    res.status(200).json({
      message: "Booking confirmed successfully",
      booking
    });
  } catch (error) {
    console.error("Confirm booking error:", error);
    res.status(500).json({
      message: "Failed to confirm booking",
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getAdminStats,
  getRecentBookings,
  getPendingRequests,
  confirmBooking
};
