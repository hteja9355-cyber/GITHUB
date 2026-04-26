const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getUserBookings,
  getAdminStats,
  getRecentBookings
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/", getAllBookings);
router.get("/my", protect, getUserBookings);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/recent", protect, adminOnly, getRecentBookings);

module.exports = router;
