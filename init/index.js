require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

main()
    .then(() => {
        console.log("data was initialized");
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => mongoose.connection.close());

async function main() {
    await mongoose.connect(MONGO_URL);
    await initDB();
}

const initDB = async () => {
    // geometry is required by the Listing schema, so geocode each sample location.
    const listings = [];
    for (const obj of initData.data) {
        const response = await geocodingClient
            .forwardGeocode({ query: `${obj.location}, ${obj.country}`, limit: 1 })
            .send();
        listings.push({
            ...obj,
            owner: "6ab420194490470ae082868d",
            geometry: response.body.features[0]?.geometry || { type: "Point", coordinates: [0, 0] },
        });
    }

    await Listing.deleteMany({});
    await Listing.insertMany(listings);
};
