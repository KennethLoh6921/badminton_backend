const Post = require("../models/Post");

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const { search, equipment } = req.query;

        let query = {};

        // Search by title or content
        if (search) {
            query.$or = [{ post_title: { $regex: search, $options: "i" } }, { post_content: { $regex: search, $options: "i" } }];
        }

        // Filter by equipment
        if (equipment) {
            query.post_eq = equipment;
        }

        const posts = await Post.find(query).populate("post_user_id", "name email").populate("post_eq", "eq_name eq_type").sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("post_user_id", "name email").populate("post_eq", "eq_name eq_type eq_price");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { post_title, post_content, post_eq } = req.body;

        const post = await Post.create({
            post_title,
            post_content,
            post_eq: post_eq || null,
            post_user_id: req.user._id, // From auth middleware
        });

        const populatedPost = await Post.findById(post._id).populate("post_user_id", "name email").populate("post_eq", "eq_name eq_type");

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user owns the post
        if (post.post_user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this post" });
        }

        post.post_title = req.body.post_title || post.post_title;
        post.post_content = req.body.post_content || post.post_content;
        post.post_eq = req.body.post_eq !== undefined ? req.body.post_eq : post.post_eq;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user owns the post or is admin
        if (post.post_user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await post.deleteOne();
        res.json({ message: "Post removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
