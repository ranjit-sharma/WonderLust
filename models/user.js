const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
    ],
});

// Each failed login lengthens the wait before the next try (~4s after 5, capped at 5 min); never locks permanently.
userSchema.plugin(passportLocalMongoose, { limitAttempts: true });
module.exports = mongoose.model("User", userSchema);