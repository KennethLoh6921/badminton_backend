// Import User model and JWT library
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token for authentication
 * tells what input a function needs.
 * @param {string} id - user ID
 * @returns {string} JWT token valid for 30 days
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        // Get user data from request body
        const { email, name, password, role } = req.body;

        // Auto-generate user_id from email prefix + random suffix
        const user_id = email.split("@")[0] + "_" + Date.now().toString(36);

        // Check if user already exists with same email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user in database
        // Password will be automatically hashed by the User model
        const user = await User.create({
            user_id,
            email,
            name,
            password,
            role: role || "user", // Default role is "user" if not specified
        });

        // Send success response with user data and token
        if (user) {
            res.status(201).json({
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        // Get login credentials from request body
        const { email, password } = req.body;

        // Find user by email in database
        const user = await User.findOne({ email });

        // Check if user exists and password is correct
        if (user && (await user.comparePassword(password))) {
            // Send success response with user data and token
            res.json({
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            // Send error if email or password is wrong
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            user_id: updatedUser.user_id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();
        res.json({ message: "User removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
