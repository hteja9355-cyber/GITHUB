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
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }

);

module.exports = mongoose.model("Booking", bookingSchema);