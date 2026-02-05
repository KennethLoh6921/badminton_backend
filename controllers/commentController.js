const Comment = require("../models/Comment");
const Post = require("../models/Post");

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ comment_post: req.params.postId }).populate("comment_user_id", "name email").sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { comment_post, comment_text } = req.body;

        // Check if post exists
        const post = await Post.findById(comment_post);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await Comment.create({
            comment_post,
            comment_user_id: req.user._id,
            comment_text,
        });

        // Update post comment count
        post.commentCount += 1;
        await post.save();

        const populatedComment = await Comment.findById(comment._id).populate("comment_user_id", "name email");

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user owns the comment
        if (comment.comment_user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this comment" });
        }

        comment.comment_text = req.body.comment_text || comment.comment_text;
        const updatedComment = await comment.save();

        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user owns the comment or is admin
        if (comment.comment_user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        // Update post comment count
        const post = await Post.findById(comment.comment_post);
        if (post) {
            post.commentCount = Math.max(0, post.commentCount - 1);
            await post.save();
        }

        await comment.deleteOne();
        res.json({ message: "Comment removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
};
