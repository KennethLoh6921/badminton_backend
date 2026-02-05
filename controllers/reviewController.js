const Review = require("../models/Review");
const Catalogue = require("../models/Catalogue");

// @desc    Get reviews for equipment
// @route   GET /api/reviews/equipment/:equipmentId
// @access  Public
const getReviewsByEquipment = async (req, res) => {
    try {
        const reviews = await Review.find({ r_eq: req.params.equipmentId }).populate("r_user", "name email").sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { r_star, r_eq, r_text, r_title } = req.body;

        // Check if equipment exists
        const equipment = await Catalogue.findById(r_eq);
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        // Check if user already reviewed this equipment
        const existingReview = await Review.findOne({
            r_user: req.user._id,
            r_eq: r_eq,
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this equipment" });
        }

        const review = await Review.create({
            r_star,
            r_user: req.user._id,
            r_eq,
            r_text,
            r_title,
        });

        // Update equipment average rating
        await updateEquipmentRating(r_eq);

        const populatedReview = await Review.findById(review._id).populate("r_user", "name email");

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if user owns the review
        if (review.r_user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this review" });
        }

        review.r_star = req.body.r_star || review.r_star;
        review.r_text = req.body.r_text !== undefined ? req.body.r_text : review.r_text;
        review.r_title = req.body.r_title !== undefined ? req.body.r_title : review.r_title;

        const updatedReview = await review.save();

        // Update equipment average rating
        await updateEquipmentRating(review.r_eq);

        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if user owns the review or is admin
        if (review.r_user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        const equipmentId = review.r_eq;
        await review.deleteOne();

        // Update equipment average rating
        await updateEquipmentRating(equipmentId);

        res.json({ message: "Review removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update equipment rating
const updateEquipmentRating = async (equipmentId) => {
    const reviews = await Review.find({ r_eq: equipmentId });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.r_star, 0) / totalReviews : 0;

    await Catalogue.findByIdAndUpdate(equipmentId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
    });
};

module.exports = {
    getReviewsByEquipment,
    createReview,
    updateReview,
    deleteReview,
};
