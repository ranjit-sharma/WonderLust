const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const userController = require("../controller/users")

router.get("/me", userController.me);
router.post("/signup", wrapAsync(userController.signup));
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/wishlist", isLoggedIn, wrapAsync(userController.wishlist));
router.get("/profile", isLoggedIn, wrapAsync(userController.profile));

module.exports = router;
