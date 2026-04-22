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
      totalAmount
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

module.exports = {
  createBooking,
  getAllBookings
};