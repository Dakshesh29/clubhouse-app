import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import db from "../config/db.js";
import "dotenv/config";

const router = express.Router();

const MEMBER_PASSCODE = process.env.MEMBER_PASSCODE;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

router.get("/", async (req, res, next) => {
  try {
    const queryText = `
      SELECT 
        messages.id, 
        messages.title, 
        messages.text, 
        messages."createdAt", 
        users."firstName", 
        users."lastName" 
      FROM messages 
      JOIN users ON messages."userId" = users.id 
      ORDER BY messages."createdAt" DESC`;

    const { rows } = await db.query(queryText);

    const messages = rows.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.text,
      createdAt: row.createdAt,
      author: `${row.firstName} ${row.lastName}`,
    }));

    res.render("index", { title: "Clubhouse Messages", messages: messages });
  } catch (err) {
    return next(err);
  }
});

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

router.get("/new-message", (req, res, next) => {
  if (!req.user) {
    return res.redirect("/log-in");
  }
  res.render("newMessageForm");
});

router.post("/new-message", async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/log-in");
  }
  try {
    const { title, text } = req.body;
    const userId = req.user.id;
    const queryText =
      'INSERT INTO messages(title, text, "userId") VALUES($1, $2, $3)';
    await db.query(queryText, [title, text, userId]);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

router.get("/join-club", (req, res, next) => {
  if (!req.user) {
    return res.redirect("/log-in");
  }
  res.render("joinClubForm");
});

router.post("/join-club", async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/log-in");
  }
  try {
    const { passcode } = req.body;
    if (passcode === ADMIN_PASSCODE) {
      const queryText =
        'UPDATE users SET "isMember" = true, "isAdmin" = true WHERE id = $1';
      await db.query(queryText, [req.user.id]);
      res.redirect("/");
    } else if (passcode === MEMBER_PASSCODE) {
      const queryText = 'UPDATE users SET "isMember" = true WHERE id = $1';
      await db.query(queryText, [req.user.id]);
      res.redirect("/");
    } else {
      res.render("joinClubForm", { error: "Incorrect passcode." });
    }
  } catch (err) {
    return next(err);
  }
});

router.post("/message/:id/delete", async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.redirect("/");
  }
  try {
    const messageId = req.params.id;
    await db.query("DELETE FROM messages WHERE id = $1", [messageId]);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

export default router;
