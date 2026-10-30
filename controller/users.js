const passport = require("passport");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");
const ExpressError = require("../utils/ExpressError.js");

// The signed-in user's own account; never send this for other users.
const publicUser = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        username: user.username || "",
        email: user.email || "",
        wishlist: Array.isArray(user.wishlist) ? user.wishlist : [],
    };
};

const logIn = (req, user) => new Promise((resolve, reject) => {
    req.login(user, (err) => (err ? reject(err) : resolve()));
});

module.exports.me = (req, res) => {
    res.json(req.user ? publicUser(req.user) : null);
};

module.exports.signup = async (req, res) => {
    let registeredUser;
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        registeredUser = await User.register(newUser, password);
    } catch (e) {
        // e.g. username taken, missing password or email
        throw new ExpressError(400, e.message);
    }
    await logIn(req, registeredUser);
    res.status(201).json(publicUser(registeredUser));
};

module.exports.login = (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) throw err;
            if (!user) {
                throw new ExpressError(401, info?.message || "Password or username is incorrect");
            }
            await logIn(req, user);
            res.json(publicUser(user));
        } catch (e) {
            next(e);
        }
    })(req, res, next);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.json({ ok: true });
    });
};

module.exports.wishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json((user?.wishlist || []).filter(Boolean));
};

module.exports.profile = async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ExpressError(401, "You must be logged in.");
    }

    const [profileUser, myListings, myReviews, myBookings] = await Promise.all([
        User.findById(req.user._id).populate("wishlist"),
        Listing.find({ owner: req.user._id }).sort({ _id: -1 }),
        Review.find({ author: req.user._id }).sort({ createdAt: -1 }),
        Booking.find({ user: req.user._id })
            .populate("listing", "title price image location country")
            .sort({ createdAt: -1 }),
    ]);

    if (!profileUser) {
        throw new ExpressError(404, "User profile not found.");
    }

    const safeListings = Array.isArray(myListings) ? myListings : [];
    const myListingIds = safeListings.map((l) => l._id);
    const hostBookings = myListingIds.length > 0
        ? await Booking.find({ listing: { $in: myListingIds } })
            .populate("listing", "title price image location country")
            .populate("user", "username email")
            .sort({ createdAt: -1 })
        : [];

    const safeReviews = Array.isArray(myReviews) ? myReviews : [];
    const reviewIds = safeReviews.map((review) => review._id);
    const reviewedListings = reviewIds.length > 0
        ? await Listing.find({ reviews: { $in: reviewIds } }).select("_id title reviews")
        : [];
    const listingByReviewId = new Map();

    reviewedListings.forEach((listing) => {
        if (Array.isArray(listing.reviews)) {
            listing.reviews.forEach((reviewId) => {
                if (reviewId) {
                    listingByReviewId.set(reviewId.toString(), { _id: listing._id, title: listing.title });
                }
            });
        }
    });

    res.json({
        user: publicUser(profileUser),
        listings: safeListings,
        reviews: safeReviews.map((review) => ({
            review,
            listing: review?._id ? listingByReviewId.get(review._id.toString()) || null : null,
        })),
        wishlist: (profileUser.wishlist || []).filter(Boolean),
        bookings: Array.isArray(myBookings) ? myBookings : [],
        hostBookings: Array.isArray(hostBookings) ? hostBookings : [],
    });
};
