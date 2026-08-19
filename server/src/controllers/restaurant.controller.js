const Restaurant = require("../models/restaurant");

const getRestaurants = async (req, res, next) => {
    try {
        const restaurants = await Restaurant.find();

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error) {
        next(error);
    }
};

const getRestaurantById = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        next(error);
    }
};

const createRestaurant = async (req, res, next) => {
    try {
        const body = { ...req.body };
        
        // Strip empty organization string to avoid ObjectId cast error
        if (!body.organization || body.organization === '') {
            delete body.organization;
        }

        const restaurant = await Restaurant.create(body);

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant,
        });
    } catch (error) {
        next(error);
    }
};

const updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant,
        });
    } catch (error) {
        next(error);
    }
};

const deactivateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            {
                status: "inactive",
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant deactivated successfully",
            data: restaurant,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deactivateRestaurant,
};