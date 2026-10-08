const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { isLoggedIn, saveRedirectUrl } = require("../middleware");

const userController = require("../controller/users")


router
.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        wrapAsync(userController.login)
    );

router.get("/logout", userController.logout);
router.get("/wishlist", isLoggedIn, wrapAsync(userController.renderWishlist));
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));

module.exports = router; 