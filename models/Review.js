const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        r_star: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        r_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: [true, "User reference is required"],
        },
        r_eq: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catalogue", // Reference to Catalogue model
            required: [true, "Equipment reference is required"],
        },
        r_text: {
            type: String,
            trim: true,
            maxlength: [500, "Review cannot exceed 500 characters"],
        },
        r_title: {
            type: String,
            trim: true,
            maxlength: [100, "Review title cannot exceed 100 characters"],
        },
    },
    {
        timestamps: true,
    },
);

// Prevent duplicate reviews: One user can only review one equipment once
reviewSchema.index({ r_user: 1, r_eq: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
