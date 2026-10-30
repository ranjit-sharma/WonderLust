const passport = require("passport");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");
const ExpressError = require("../utils/ExpressError.js");

// The signed-in user's own account; never send this for other users.
const publicUser = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    wishlist: user.wishlist || [],
});

const logIn = (req, user) => new Promise((resolve, reject) => {
    req.login(user, (err) => (err ? reject(err) : resolve()));
});

module.exports.me = (req, res) => {
    res.json(req.user ? publicUser(req.user) : null);
}

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
}

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
}

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.json({ ok: true });
    });
}

module.exports.wishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json((user.wishlist || []).filter(Boolean));
}

module.exports.profile = async (req, res) => {
    const [profileUser, myListings, myReviews, myBookings] = await Promise.all([
        User.findById(req.user._id).populate("wishlist"),
        Listing.find({ owner: req.user._id }).sort({ _id: -1 }),
        Review.find({ author: req.user._id }).sort({ createdAt: -1 }),
        Booking.find({ user: req.user._id })
            .populate("listing", "title price image location")
            .sort({ createdAt: -1 }),
    ]);

    const reviewIds = myReviews.map((review) => review._id);
    const reviewedListings = await Listing.find({ reviews: { $in: reviewIds } })
        .select("_id title reviews");
    const listingByReviewId = new Map();

    reviewedListings.forEach((listing) => {
        listing.reviews.forEach((reviewId) => {
            listingByReviewId.set(reviewId.toString(), { _id: listing._id, title: listing.title });
        });
    });

    res.json({
        user: publicUser(profileUser),
        listings: myListings,
        reviews: myReviews.map((review) => ({
            review,
            listing: listingByReviewId.get(review._id.toString()) || null,
        })),
        wishlist: (profileUser.wishlist || []).filter(Boolean),
        bookings: myBookings,
    });
}
