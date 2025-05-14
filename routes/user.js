const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { isLoggedIn, savedRedirectUrl } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

const router = express.Router();



// ✅ Render Sign-Up Page (No authentication required)
router.get("/signup", (req, res) => {
    res.render("users/signup", { error: req.flash("error") });
});

// ✅ Handle Sign-Up Logic
// Handle Sign-Up Logic
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        
        req.login(registeredUser, (err) => {
            if (err){
                 return next(err);
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect("/listings");
        })
            
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
})
);

// ✅ Render Login Page (No authentication required)
router.get("/login", (req, res) => {
    res.render("users/login", { error: req.flash("error") });
});

// ✅ Handle Login Logic
router.post(
    "/login",savedRedirectUrl,
    (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                req.flash("error", "Invalid username or password");
                return res.redirect("/login");
            }
            req.logIn(user, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome back to WanderLust!");
                return res.redirect(res.locals.redirectUrl || "/listings"); 
            });
        })(req, res, next);
    }
);


// ✅ Logout Route (Protected Route)
router.get("/logout", isLoggedIn, (req, res) => {
    req.logout(() => {
        req.flash("success", "Logged out successfully!");
        res.redirect("/login");
    });
});

module.exports = router;
