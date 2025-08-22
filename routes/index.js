import express from "express";
const router = express.Router();

router.get("/sign-up", (req, res, next) => {
  res.render("signUpForm", { title: "Sign Up" });
});

export default router;
