const Listing = require("../models/listing");
const Review = require("../models/review.js");
const Booking = require("../models/booking.js");
const categories = require("../utils/categories.js");
const locationOptions = require("../utils/locationOptions.js");
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
        ratingPipeline.push({ $sort: { bookingCount: -1, createdAt: -1 } });
    }

    const allListings = await Listing.aggregate(ratingPipeline);

    res.render("listings/index.ejs", {
        allListings,
        categories,
        category,
        location,
        country,
        minPrice,
        maxPrice,
        minRating,
        q,
        showFilters: true,
    });
}

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    const isSaved = (req.user.wishlist || []).some((listingId) => listingId.equals(id));
    const update = isSaved
        ? { $pull: { wishlist: id } }
        : { $addToSet: { wishlist: id } };

    await req.user.updateOne(update);
    req.flash("success", isSaved ? "Removed from your wishlist." : "Added to your wishlist.");
    res.redirect(req.get("Referrer") || `/listings/${id}`);
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { categories, ...locationOptions });
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    const reviewCount = listing.reviews.length;
    const validReviews = listing.reviews.filter(r => r && typeof r.rating === 'number');
    const averageRating = validReviews.length
        ? validReviews.reduce((total, review) => total + review.rating, 0) / validReviews.length
        : 0;
    console.log(listing);
    res.render("listings/show.ejs", { listing, averageRating, reviewCount });
}






module.exports.createListing = async (req, res, next) => {
    if (!req.file) {
        req.flash("error", "Listing image is required!");
        return res.redirect("/listings/new");
    }

    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();

    if (!response.body.features.length) {
        req.flash("error", "Invalid location provided. Please try a different location.");
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New listing created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are represented for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url?.replace("/upload", "/upload/w_250,") || "";
    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
        categories,
        ...locationOptions,
    });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    const oldImage = listing.image;
    Object.assign(listing, req.body.listing);

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
    }

    await listing.save();

    if (typeof req.file !== "undefined") {
        await deleteCloudinaryImage(oldImage);
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);
    await deleteCloudinaryImage(listing.image);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}