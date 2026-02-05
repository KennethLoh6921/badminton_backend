const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        comment_post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post", // Reference to Post model
            required: [true, "Post reference is required"],
        },
        comment_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: [true, "User reference is required"],
        },
        comment_text: {
            type: String,
            required: [true, "Comment text is required"],
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Comment", commentSchema);
