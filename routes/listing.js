const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js")
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require('../cloudConfig.js');
const upload = multer({storage });


router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    
    upload.single('listing[image]'),validateListing,
    wrapAsync(listingController.createListing)
);



//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);  
// 🔥 Move your search route here:
router.get("/search", async (req, res) => {
    const { q } = req.query;
    if (!q) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }
    try {
        const listings = await Listing.find({ location: { $regex: q, $options: 'i' } });
        res.render("listings/index", { AllListings: listings });
    } catch (err) {
        console.error("Error during search:", err);
        req.flash("error", "An error occurred while searching.");
        res.redirect("/listings");
    }
});
router.route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing
        ))
    .delete(isLoggedIn,isOwner,
        wrapAsync(listingController.deleteListing));

//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync (listingController.renderEditForm));

module.exports = router;