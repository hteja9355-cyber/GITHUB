const express = require("express");
const router = express.Router();
const {
  getBookingAnalytics,
  getRevenueByService,
  getMonthlyStats
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/bookings", protect, adminOnly, getBookingAnalytics);
router.get("/revenue", protect, adminOnly, getRevenueByService);
router.get("/monthly", protect, adminOnly, getMonthlyStats);

module.exports = router;
