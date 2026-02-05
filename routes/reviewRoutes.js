const express = require("express");
const router = express.Router();
const { getReviewsByEquipment, createReview, updateReview, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Public route
router.get("/equipment/:equipmentId", getReviewsByEquipment);

// Protected routes
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
