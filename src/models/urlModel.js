const mongoose = require('mongoose');
// import mongoose from 'mongoose';

// URL Schema
const urlSchema = new mongoose.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
},
    {
        timestamps: true
    }
);

// Export the model
module.exports = mongoose.model('url', urlSchema);