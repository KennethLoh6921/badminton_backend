const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
//CORS is a security feature that allows or blocks requests between different websites.
app.use(express.json());

// Database connection
const connectDB = require("./config/db");
connectDB();

// Import routes
const userRoutes = require("./routes/userRoutes");
const catalogueRoutes = require("./routes/catalogueRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/catalogue", catalogueRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reviews", reviewRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "BadmintonHub API is running!",
        endpoints: {
            users: "/api/users",
            catalogue: "/api/catalogue",
            posts: "/api/posts",
            comments: "/api/comments",
            reviews: "/api/reviews",
        },
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
