const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getAllServicesForAdmin,
  createService,
  updateService,
  deleteService
} = require("../controllers/serviceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllServices);
router.get("/admin/all", protect, adminOnly, getAllServicesForAdmin);
router.post("/", protect, adminOnly, createService);
router.put("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);

module.exports = router;
