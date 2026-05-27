const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    pollutionType: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String
    },

    status: {
        type: String,
        default: "Pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Complaint",
    complaintSchema
);