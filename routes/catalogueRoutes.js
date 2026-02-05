const express = require("express");
const router = express.Router();
const { getAllEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment } = require("../controllers/catalogueController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);

// Admin only routes
router.post("/", protect, admin, createEquipment);
router.put("/:id", protect, admin, updateEquipment);
router.delete("/:id", protect, admin, deleteEquipment);

module.exports = router;
