const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        post_title: {
            type: String,
            required: [true, "Post title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        post_content: {
            type: String,
            required: [true, "Post content is required"],
            trim: true,
        },
        post_eq: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Catalogue", // Reference to Catalogue model
            default: null, // Optional field
        },
        post_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: true,
        },
        // Count of comments (for display)
        commentCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Post", postSchema);
