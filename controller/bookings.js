const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

const parseDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests, specialRequests } = req.body;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing does not exist!");
    }

    const arrival = parseDate(checkIn);
    const departure = parseDate(checkOut);
    const guestCount = Number(guests);

    if (!arrival || !departure || departure <= arrival) {
        throw new ExpressError(400, "Please select valid check-in and check-out dates.");
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
        throw new ExpressError(400, "Guests must be at least 1.");
    }

    const bookingNotes = typeof specialRequests === "string" ? specialRequests.trim() : "";
    if (bookingNotes.length > 300) {
        throw new ExpressError(400, "Special requests must be 300 characters or fewer.");
    }

    const existingBooking = await Booking.findOne({
        listing: id,
        status: { $ne: "cancelled" },
        checkIn: { $lt: departure },
        checkOut: { $gt: arrival },
    });

    if (existingBooking) {
        throw new ExpressError(400, "This listing is already booked for those dates.");
    }

    const nights = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
    const basePrice = nights * listing.price;
    const totalPrice = Math.round(basePrice * 1.18);

    const booking = await Booking.create({
        user: req.user._id,
        listing: id,
        checkIn: arrival,
        checkOut: departure,
        guests: guestCount,
        specialRequests: bookingNotes,
        totalPrice,
        status: "confirmed",
    });

    res.render("bookings/confirmation.ejs", {
        booking,
        listing,
        nights,
        basePrice,
        gst: totalPrice - basePrice,
    });
};

module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findOne({
        _id: req.params.bookingId,
        user: req.user._id,
    });

    if (!booking) {
        throw new ExpressError(404, "Booking does not exist.");
    }

    if (booking.status === "cancelled") {
        req.flash("error", "This booking is already cancelled.");
        return res.redirect("/profile");
    }

    booking.status = "cancelled";
    await booking.save();
    req.flash("success", "Your booking has been cancelled.");
    res.redirect("/profile");
};

module.exports.deleteBooking = async (req, res) => {
    const booking = await Booking.findOne({
        _id: req.params.bookingId,
        user: req.user._id,
    });

    if (!booking) {
        throw new ExpressError(404, "Booking does not exist.");
    }

    if (booking.status !== "cancelled") {
        throw new ExpressError(400, "Only cancelled bookings can be deleted.");
    }

    await booking.deleteOne();
    req.flash("success", "Cancelled booking deleted.");
    res.redirect("/profile");
};
