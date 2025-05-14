const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressErrors = require("./utils/ExpressErrors.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // If the user is not authenticated, redirect to the login page
        req.session.redirectUrl= req.originalUrl;
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
};

// ✅ Middleware to Pass Flash Messages to Views
module.exports.setFlashMessages = (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
        let listing =  await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","Only owners have access to do so!");
            return res.redirect(`/listings/${id}`);
        }
        next();
};

module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
  
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
     throw new ExpressErrors(400,errMsg);
    } else{
        next();
    }
}

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
  
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
     throw new ExpressError(400,errMsg);
    } else{
        next();
    }
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id, reviewId } = req.params;
        let review =  await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error","Only owners have access to do so!");
            return res.redirect(`/listings/${id}`);
        }
        next();
};