const Listing = require("../models/listing");
const Review = require("../models/review.js");
const Booking = require("../models/booking.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require("../cloudConfig.js");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const deleteCloudinaryImage = async (image) => {
    if (!image?.filename || !image.url?.includes("res.cloudinary.com")) {
        return;
    }

    const result = await cloudinary.uploader.destroy(image.filename, {
        resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error(`Cloudinary image deletion failed: ${result.result}`);
    }
};

const geocode = async (location) => {
    const response = await geocodingClient
        .forwardGeocode({ query: location, limit: 1 })
        .send();
    return response.body.features[0]?.geometry;
};

const uploadedImage = (file) => file && { url: file.path, filename: file.filename };

module.exports.index = async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const location = typeof req.query.location === "string" ? req.query.location : "";
    const country = typeof req.query.country === "string" ? req.query.country : "";
    const minPrice = typeof req.query.minPrice === "string" ? req.query.minPrice : "";
    const maxPrice = typeof req.query.maxPrice === "string" ? req.query.maxPrice : "";
    const minRating = typeof req.query.minRating === "string" ? req.query.minRating : "";
    const filter = {};

    if (q.trim()) {
        const escapedQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { title: new RegExp(escapedQ, "i") },
            { location: new RegExp(escapedQ, "i") },
            { country: new RegExp(escapedQ, "i") },
            { category: new RegExp(escapedQ, "i") }
        ];
    }

    if (category && category !== "Trending") {
        filter.category = category;
    }

    if (location.trim()) {
        const escapedLocation = location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.location = new RegExp(escapedLocation, "i");
    }

    if (country.trim()) {
        const escapedCountry = country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.country = new RegExp(escapedCountry, "i");
    }

    const minimumPrice = minPrice.trim() ? Number(minPrice) : NaN;
    const maximumPrice = maxPrice.trim() ? Number(maxPrice) : NaN;
    if (Number.isFinite(minimumPrice) || Number.isFinite(maximumPrice)) {
        filter.price = {};
        if (Number.isFinite(minimumPrice)) filter.price.$gte = minimumPrice;
        if (Number.isFinite(maximumPrice)) filter.price.$lte = maximumPrice;
    }

    const minimumRating = minRating.trim() ? Number(minRating) : NaN;
    const ratingPipeline = [
        { $match: filter },
        {
            $lookup: {
                from: Review.collection.name,
                localField: "reviews",
                foreignField: "_id",
                as: "reviewDocs",
            },
        },
        {
            $addFields: {
                averageRating: { $ifNull: [{ $avg: "$reviewDocs.rating" }, 0] },
                reviewCount: { $size: "$reviewDocs" },
            },
        },
    ];

    if (Number.isFinite(minimumRating)) {
        ratingPipeline.push({ $match: { averageRating: { $gte: minimumRating } } });
    }

    if (category === "Trending") {
        ratingPipeline.push(
            {
                $lookup: {
                    from: Booking.collection.name,
                    let: { listingId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$listing", "$$listingId"] },
                                status: "confirmed",
                            },
                        },
                        { $count: "total" },
                    ],
                    as: "bookingStats",
                },
            },
            {
                $addFields: {
                    bookingCount: {
                        $ifNull: [{ $arrayElemAt: ["$bookingStats.total", 0] }, 0],
                    },
                },
            },
        );
        // Listings have no timestamps; _id order is creation order.
        ratingPipeline.push({ $sort: { bookingCount: -1, _id: -1 } });
    }

    // reviewDocs/bookingStats were only needed to compute the fields above.
    ratingPipeline.push({ $project: { reviewDocs: 0, bookingStats: 0 } });
    res.json(await Listing.aggregate(ratingPipeline));
}

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing does not exist!");
    }

    const isSaved = (req.user.wishlist || []).some((listingId) => listingId.equals(id));
    const update = isSaved
        ? { $pull: { wishlist: id } }
        : { $addToSet: { wishlist: id } };

    await req.user.updateOne(update);
    res.json({ saved: !isSaved });
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // Only usernames: emails and wishlists must not reach other visitors.
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username",
            },
        })
        .populate("owner", "username");
    if (!listing) {
        throw new ExpressError(404, "Listing you requested for does not exist!");
    }
    const reviewCount = listing.reviews.length;
    const validReviews = listing.reviews.filter(r => r && typeof r.rating === 'number');
    const averageRating = validReviews.length
        ? validReviews.reduce((total, review) => total + review.rating, 0) / validReviews.length
        : 0;
    res.json({ listing, averageRating, reviewCount });
}

module.exports.createListing = async (req, res) => {
    if (!req.file) {
        throw new ExpressError(400, "Listing image is required!");
    }

    const geometry = await geocode(req.body.listing.location);
    if (!geometry) {
        await deleteCloudinaryImage(uploadedImage(req.file));
        throw new ExpressError(400, "Invalid location provided. Please try a different location.");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = uploadedImage(req.file);
    newListing.geometry = geometry;
    await newListing.save();

    res.status(201).json(newListing);
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing you requested for does not exist!");
    }

    const oldImage = listing.image;
    const locationChanged = req.body.listing.location !== listing.location;
    Object.assign(listing, req.body.listing);

    if (locationChanged) {
        const geometry = await geocode(listing.location);
        if (!geometry) {
            await deleteCloudinaryImage(uploadedImage(req.file));
            throw new ExpressError(400, "Invalid location provided. Please try a different location.");
        }
        listing.geometry = geometry;
    }

    if (typeof req.file !== "undefined") {
        listing.image = uploadedImage(req.file);
    }

    await listing.save();

    if (typeof req.file !== "undefined") {
        await deleteCloudinaryImage(oldImage);
    }

    res.json(listing);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing you requested for does not exist!");
    }

    await Listing.findByIdAndDelete(id);
    await deleteCloudinaryImage(listing.image);

    res.json({ ok: true });
}
