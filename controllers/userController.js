import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/user.js";

export const get_sign_up_form = (req, res, next) => {
  res.render("signUpForm", { title: "Sign Up" });
};

export const post_sign_up_form = [
  body("firstName", "First name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Please enter a valid email.").isEmail().normalizeEmail(),
  body("password", "Password must be at least 6 characters long.").isLength({
    min: 6,
  }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("signUpForm", {
        title: "Sign Up",
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
      });

      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  },
];
