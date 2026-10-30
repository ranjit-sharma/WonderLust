if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const {MongoStore} = require ('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const infoRouter = require("./routes/info.js");

 
const dbUrl = process.env.ATLASDB_URL; //online db


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });


async function main() {
  await mongoose.connect(dbUrl);
}

const clientDist = path.join(__dirname, "client", "dist");

app.use(express.json());
// Static files before the session so assets don't create sessions.
app.use(express.static(clientDist));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // Blocks the cookie on cross-site POSTs (CSRF); not every browser defaults to this.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

// Render terminates HTTPS at its proxy; trust it so secure cookies are still sent.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* app.get("/demouser",async (req,res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "student",
    });

    let registerdUser = await User.register(fakeUser,"helloworld");
    res.send(registerdUser);
}); */

app.use("/api/listings", listingRouter); //for listing
app.use("/api/listings/:id/reviews", reviewRouter); //for review
app.use("/api/listings/:id/bookings", bookingRouter); //for booking
app.use("/api", userRouter); //for user
app.use("/api", infoRouter); //for site metadata and support forms

app.all("/api/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Every other URL is a page of the React app, which does its own routing.
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err, req, res, next) => {
  // A malformed ObjectId in the URL means the page doesn't exist.
  if (err.name === "CastError") {
    err = new ExpressError(404, "Page Not Found!");
  }
  // http_code: Cloudinary upload errors (e.g. wrong image format) are user errors.
  let statusCode = err.statusCode || err.http_code || 500;
  let message = err.message || "Something Went Wrong!";
  if (statusCode >= 500) {
    console.error(err);
    message = "Something Went Wrong!"; // don't show internal error details to users
  }
  res.status(statusCode).json({ error: message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
