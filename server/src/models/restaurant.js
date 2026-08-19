const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: false, // Super Admin can create branches independent of org
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 10,
        minlength: 8,
    },

    address:{
        street:{
            type : String,
            trim :true,
        },
        city:{
            type : String,
            required : true,
        },
        state:{
            type : String,
            required : true,
        },
        country:{
            type : String,
            required : true,
        },
        postalcode:{
            type : String,
            required : true,
        },
    },
        
    contact:{
        phone:{
            type:String,
            required : true,
            unique : true,
        },
        email:{
            type:String,
            required : true,
            unique : true,
        },
    },
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
},
{
    timestamps: true,
}
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;

