const mongoose = require("mongoose");

const supportSubmissionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["feedback", "neighbourhood-concern"],
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    reference: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("SupportSubmission", supportSubmissionSchema);
