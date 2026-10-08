const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controller/bookings.js");

router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));
router.post("/:bookingId/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
router.delete("/:bookingId", isLoggedIn, wrapAsync(bookingController.deleteBooking));

module.exports = router;
