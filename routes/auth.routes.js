import express from "express";
import validateUser from "../middleware/validateUser.js";
import { createUser } from "../controllers/auth.controllers.js";

const router = express.Router();

router.use("/register", validateUser, createUser);

export default router;
