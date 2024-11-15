import express from "express";
import validateUser from "../middleware/validateUser.js";
import {
  createUser,
  loginUser,
  logoutUser,
  verifyUser,
  resendVerification,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", validateUser, createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify/:verificationToken", verifyUser);
router.post("/resend-verification", resendVerification);

export default router;
