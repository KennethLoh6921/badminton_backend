// Import mongoose for MongoDB schema and bcryptjs for password hashing
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User schema with required fields and validation rules
const userSchema = new mongoose.Schema(
    {
        // Unique identifier for the user
        user_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // User's email with format validation using regex
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        // User's display name
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        // User's password (stored as a hashed value, minimum 6 characters)
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        // User role for authorization — either "user" or "admin"
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    },
);

// Mongoose pre-save middleware — runs before every save operation
// Hashes the password so we never store plain text passwords in the database
userSchema.pre("save", async function () {
    //Only hash when password is new or updated.
    if (!this.isModified("password")) {
        return;
    }

    // Turn password into secret code before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare a plain text password with the stored hashed password
//Check if login password is correct.
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Export User database structure so other files can use it.
module.exports = mongoose.model("User", userSchema);
