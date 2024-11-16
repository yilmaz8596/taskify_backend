import express from "express";
import validateUser from "../middleware/validateUser.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
