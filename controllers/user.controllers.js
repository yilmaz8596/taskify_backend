import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const token = await generateToken(
      { userId: user._id },
      process.env.JWT_SECRET
    );
    await sendPasswordResetEmail(user.email, token);
    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    next(createHttpError(500, `An error occurred: ${error.message}`));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return next(createHttpError(400, "Token is required"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const { userId } = decoded;
    const { newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      return next(createHttpError(400, "Passwords do not match"));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    next(createHttpError(500, `Problem resetting password: ${error.message}`));
  }
};
