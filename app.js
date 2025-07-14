if(process.env.NODE_ENV != "production") {
    require("dotenv").config(); 
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const ExpressErrors = require("./utils/ExpressErrors.js");
const Listing = require("./models/listing.js");


// Routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlustDB";

const dbUrl = process.env.ATLASDB_URL;

// ✅ Connect to MongoDB
async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
}
main().catch((err) => console.log(err));

// ✅ Set View Engine & Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Session Configuration
const sessionOptions = {
    secret: "mysupersecretecode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Global Middleware for Flash Messages
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log("Flash Success Message:", res.locals.success);
    console.log("Flash Error Message:", res.locals.error);
    res.locals.currUser = req.user;
    next();
});

// // ✅ Routes
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/listings/category/:category", async (req, res) => {
    const { category } = req.params;

    let listings;

    if (category === 'View all') {
        // If the category is 'View all', fetch all listings
        listings = await Listing.find({});
    } else {
        // Otherwise, fetch listings filtered by category
        listings = await Listing.find({ category: category });
    }

    res.render("listings/index", { AllListings: listings });
});

// ✅ Sample Route for Testing Flash Messages
app.get("/demouser", async (req, res) => {
    try {
        let fakeUser = new User({
            email: "example@gmail.com",
            username: "student"
        });
        let registeredUser = await User.register(fakeUser, "helloWorld"); // Password is "helloWorld"
        req.flash("success", "User registered successfully!");
        res.redirect("/listings"); // Redirect so flash message appears
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup"); // Redirect to signup if there's an error
    }
});

// ✅ Error Handling Middleware
app.all("*", (req, res, next) => {
    next(new ExpressErrors(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// ✅ Start Server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
