import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import db from "../config/db.js";

const router = express.Router();

router.get("/sign-up", (req, res, next) => {
  res.render("signUpForm", { title: "Sign Up" });
});

router.post("/sign-up", async (req, res, next) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } =
      req.body;
    const errors = [];

    if (!firstName) {
      errors.push({ msg: "First name must not be empty." });
    }
    if (!lastName) {
      errors.push({ msg: "Last name must not be empty." });
    }
    if (!username || !username.includes("@")) {
      errors.push({ msg: "Please enter a valid email." });
    }
    if (!password || password.length < 6) {
      errors.push({ msg: "Password must be at least 6 characters long." });
    }
    if (password !== confirmPassword) {
      errors.push({ msg: "Passwords do not match." });
    }

    if (errors.length > 0) {
      return res.render("signUpForm", {
        title: "Sign Up",
        user: req.body,
        errors: errors,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const text =
      'INSERT INTO users("firstName", "lastName", username, password) VALUES($1, $2, $3, $4)';
    const values = [firstName, lastName, username, hashedPassword];

    await db.query(text, values);

    res.redirect("/log-in");
  } catch (err) {
    return next(err);
  }
});

router.get("/log-in", (req, res, next) => {
  res.render("logInForm");
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })
);

router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

export default router;
