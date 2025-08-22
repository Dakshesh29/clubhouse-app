import express from "express";
import {
  get_sign_up_form,
  post_sign_up_form,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/sign-up", get_sign_up_form);

router.post("/sign-up", post_sign_up_form);

export default router;
