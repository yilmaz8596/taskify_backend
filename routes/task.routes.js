import express from "express";
import { verifyUser } from "../middleware/verifyUser.js";
import { createTask } from "../controllers/task.controllers.js";

const router = express.Router();

router.post("/", verifyUser, createTask);

export default router;
