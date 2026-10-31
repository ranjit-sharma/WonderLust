const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing does not exist!");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    await newReview.save();
    // $push instead of listing.save(): saving re-validates the whole listing, which fails
    // for older listings whose category is no longer in the enum (e.g. "Trending").
    await Listing.updateOne({ _id: listing._id }, { $push: { reviews: newReview._id } });
    await newReview.populate("author", "username");
    res.status(201).json(newReview);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Concurrently remove the review reference from the listing and delete the review document
    await Promise.all([
        id
            ? Listing.updateOne({ _id: id }, { $pull: { reviews: reviewId } })
            : Listing.updateMany({ reviews: reviewId }, { $pull: { reviews: reviewId } }),
        Review.findByIdAndDelete(reviewId),
    ]);

    res.json({ ok: true });
};
