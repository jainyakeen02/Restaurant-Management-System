const express = require("express");
const Restaurant = require("../models/restaurant");

const router = express.Router();

router.post("/", async (req, res) =>{
    try{
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json({
            success :true,
            message:"Restaurant Created Successfully",
            data: restaurant,
        });
    }catch (error){
        console.error("Restaurant creation failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create restaurant",
        });
    }
});

module.exports = router;