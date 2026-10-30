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

    const fail = (message) => {
        throw new ExpressError(400, message);
    };

    if (listing.owner?.equals(req.user._id)) {
        return fail("You cannot book your own listing.");
    }

    const arrival = parseDate(checkIn);
    const departure = parseDate(checkOut);
    const guestCount = Number(guests);
    const today = parseDate(new Date().toISOString().slice(0, 10));

    if (!arrival || !departure || departure <= arrival) {
        return fail("Please select valid check-in and check-out dates.");
    }

    if (arrival < today) {
        return fail("Check-in date cannot be in the past.");
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
        return fail("Guests must be at least 1.");
    }

    const bookingNotes = typeof specialRequests === "string" ? specialRequests.trim() : "";
    if (bookingNotes.length > 300) {
        return fail("Special requests must be 300 characters or fewer.");
    }

    // shortcut: check-then-insert can race two simultaneous requests into a double booking; add a lock or unique index if traffic grows.
    const existingBooking = await Booking.findOne({
        listing: id,
        status: { $ne: "cancelled" },
        checkIn: { $lt: departure },
        checkOut: { $gt: arrival },
    });

    if (existingBooking) {
        return fail("This listing is already booked for those dates.");
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

    res.status(201).json({
        booking,
        listing: { _id: listing._id, title: listing.title, price: listing.price, image: listing.image },
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
        throw new ExpressError(400, "This booking is already cancelled.");
    }

    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
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
    res.json({ ok: true });
};
