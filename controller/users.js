const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.renderWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    const validListings = (user.wishlist || []).filter(Boolean);
    res.render("users/wishlist.ejs", { listings: validListings });
}

module.exports.renderProfile = async (req, res) => {
    const [profileUser, myListings, myReviews, myBookings] = await Promise.all([
        User.findById(req.user._id).populate("wishlist"),
        Listing.find({ owner: req.user._id }).sort({ _id: -1 }),
        Review.find({ author: req.user._id }).sort({ createdAt: -1 }),
        Booking.find({ user: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 }),
    ]);

    const reviewIds = myReviews.map((review) => review._id);
    const reviewedListings = await Listing.find({ reviews: { $in: reviewIds } })
        .select("_id title reviews");
    const listingByReviewId = new Map();

    reviewedListings.forEach((listing) => {
        listing.reviews.forEach((reviewId) => {
            listingByReviewId.set(reviewId.toString(), listing);
        });
    });

    const reviewsWithListings = myReviews.map((review) => ({
        review,
        listing: listingByReviewId.get(review._id.toString()),
    }));

    res.render("users/profile.ejs", {
        profileUser,
        myListings,
        myReviews: reviewsWithListings,
        wishlist: (profileUser.wishlist || []).filter(Boolean),
        myBookings,
    });
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
}