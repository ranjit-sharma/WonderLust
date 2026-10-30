const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema, } = require("./schema.js");
const { cloudinary } = require("./cloudConfig.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        throw new ExpressError(401, "You must be logged in to do that!");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing does not exist!");
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        throw new ExpressError(403, "You are not the owner of this listing");
    }
    next();
};

module.exports.validateListing = async (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        // multer has already uploaded the image; don't leave it orphaned in Cloudinary.
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review does not exist!");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        throw new ExpressError(403, "You did not create the review");
    }
    next();
};
