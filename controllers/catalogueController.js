// Import Catalogue model
const Catalogue = require("../models/Catalogue");

// @desc    Get all equipment with optional filters
// @route   GET /api/catalogue
// @access  Public
const getAllEquipment = async (req, res) => {
    try {
        // Get filter parameters from URL query string
        const { type, search, minPrice, maxPrice } = req.query;

        // Build MongoDB query object based on filters
        let query = {};

        // Filter by equipment type (racket, shoes, etc.)
        if (type) {
            query.eq_type = type;
        }

        // Search by name using regex (case insensitive)
        if (search) {
            query.eq_name = { $regex: search, $options: "i" };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.eq_price = {};
            if (minPrice) query.eq_price.$gte = Number(minPrice); // Greater than or equal to min
            if (maxPrice) query.eq_price.$lte = Number(maxPrice); // Less than or equal to max
        }

        // Execute query and sort by newest first
        const equipment = await Catalogue.find(query).sort({ createdAt: -1 });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single equipment by ID
// @route   GET /api/catalogue/:id
// @access  Public
const getEquipmentById = async (req, res) => {
    try {
        // Find equipment in database by ID
        const equipment = await Catalogue.findById(req.params.id);

        // Return error if equipment not found
        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        // Send equipment data
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new equipment
// @route   POST /api/catalogue
// @access  Private/Admin
const createEquipment = async (req, res) => {
    try {
        const { eq_name, eq_type, eq_price, eq_brand, eq_description, eq_image } = req.body;

        const equipment = await Catalogue.create({
            eq_name,
            eq_type,
            eq_price,
            eq_brand,
            eq_description,
            eq_image,
        });

        res.status(201).json(equipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update equipment
// @route   PUT /api/catalogue/:id
// @access  Private/Admin
const updateEquipment = async (req, res) => {
    try {
        const equipment = await Catalogue.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        Object.assign(equipment, req.body);
        const updatedEquipment = await equipment.save();

        res.json(updatedEquipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete equipment
// @route   DELETE /api/catalogue/:id
// @access  Private/Admin
const deleteEquipment = async (req, res) => {
    try {
        const equipment = await Catalogue.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ message: "Equipment not found" });
        }

        await equipment.deleteOne();
        res.json({ message: "Equipment removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};
