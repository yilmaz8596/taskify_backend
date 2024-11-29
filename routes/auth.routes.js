import express from "express";
import validateUser from "../middleware/validateUser.js";
import passport from "passport";
import {
  createUser,
  loginUser,
  logoutUser,
  verifyUser,
  resendVerification,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL + "/dashboard",
  })
);

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify/:verificationToken", verifyUser);
router.post("/resend-verification", resendVerification);

export default router;
