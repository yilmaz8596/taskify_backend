import express from "express";
import validateUser from "../middleware/validateUser.js";
import {
  createUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", validateUser, createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
