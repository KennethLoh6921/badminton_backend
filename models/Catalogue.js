const mongoose = require("mongoose");

const catalogueSchema = new mongoose.Schema(
    {
        eq_name: {
            type: String,
            required: [true, "Equipment name is required"],
            trim: true,
        },
        eq_type: {
            type: String,
            required: [true, "Equipment type is required"],
            enum: ["racket", "shuttlecock", "shoes", "bag", "grip", "string", "accessories"],
            lowercase: true,
        },
        eq_price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        eq_brand: {
            type: String,
            trim: true,
        },
        eq_description: {
            type: String,
            trim: true,
        },
        eq_image: {
            type: String, // URL or file path
            default: "",
        },
        // Average rating (calculated from reviews)
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        // Total number of reviews
        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Catalogue", catalogueSchema);
