const express = require("express");
const SupportSubmission = require("../models/supportSubmission.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const categories = require("../utils/categories.js");
const locationOptions = require("../utils/locationOptions.js");

const router = express.Router();

// Form options plus the public Mapbox token the map needs in the browser.
router.get("/meta", (req, res) => {
    res.json({ categories, ...locationOptions, mapToken: process.env.MAP_TOKEN });
});

router.post("/support/neighbourhood-concern", wrapAsync(async (req, res) => {
    const { name, email, reference, concern } = req.body;
    if (!name?.trim() || !email?.trim() || !concern?.trim()) {
        throw new ExpressError(400, "Please complete all complaint form fields.");
    }

    await SupportSubmission.create({
        type: "neighbourhood-concern",
        name,
        email,
        reference,
        message: concern,
    });
    res.status(201).json({ ok: true });
}));

router.post("/feedback", wrapAsync(async (req, res) => {
    const { name, email, rating, message } = req.body;
    if (!name?.trim() || !email?.trim() || !rating || !message?.trim()) {
        throw new ExpressError(400, "Please complete all feedback fields.");
    }

    await SupportSubmission.create({
        type: "feedback",
        name,
        email,
        rating: Number(rating),
        message,
    });
    res.status(201).json({ ok: true });
}));

module.exports = router;
