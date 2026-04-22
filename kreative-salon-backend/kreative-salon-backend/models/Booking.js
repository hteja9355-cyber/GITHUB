const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    services: {
      type: [String],
      required: true
    },
    appointmentDate: {
      type: String,
      required: true
    },
    appointmentTime: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);