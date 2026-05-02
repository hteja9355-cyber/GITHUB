const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getUserBookings,
  getAdminStats,
  getRecentBookings,
  getPendingRequests,
  confirmBooking
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/", getAllBookings);
router.get("/my", protect, getUserBookings);
router.get("/admin/stats", protect, adminOnly, getAdminStats);
router.get("/admin/recent", protect, adminOnly, getRecentBookings);
router.get("/admin/requests", protect, adminOnly, getPendingRequests);
router.put("/:id/confirm", protect, adminOnly, confirmBooking);

module.exports = router;
