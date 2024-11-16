import User from "../models/user.model.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/generateToken.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";

export const createUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createHttpError.Conflict("User already exists"));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user first to get the ID
    await user.save();

    // Generate token with user ID
    const verificationToken = await generateToken(
      { userId: user._id }, // Include userId in payload
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Increased time to 24 hours
    );

    console.log(verificationToken);

    // Update user with verification token
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).send({
      status: "success",
      message:
        "User created successfully. Please check your email to verify your account.",
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    next(
      createHttpError.InternalServerError(
        `Problem with creating a new user. ${error}`
      )
    );
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return next(
        createHttpError.BadRequest("Please provide all required fields")
      );
    }

    // Find user (case-insensitive)
    const userExists = await User.findOne({ username: username });
    if (!userExists) {
      return next(createHttpError.NotFound("User does not exist"));
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return next(createHttpError.Unauthorized("Invalid credentials"));
    }

    if (userExists.isVerified === false) {
      return next(
        createHttpError.Unauthorized("Please verify your email to login")
      );
    }

    // Generate JWT token
    const token = await generateToken(
      { id: userExists._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Send response
    res.status(200).send({
      status: "success",
      message: "User logged in successfully",
      user: {
        firstname: userExists.firstname,
        lastname: userExists.lastname,
        username: userExists.username,
        email: userExists.email,
      },
    });
  } catch (error) {
    console.error(error);
    next(
      createHttpError.InternalServerError(
        `Problem with logging in. ${error.message}`
      )
    );
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).send({
      status: "success",
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error(error);
    next(
      createHttpError.InternalServerError(
        `Problem with logging out. ${error.message}`
      )
    );
  }
};

// controllers/auth.controller.js
export const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    // Find user by token first
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return next(createHttpError(404, "Invalid verification token"));
    }

    if (user.isVerified) {
      return next(createHttpError(400, "User is already verified"));
    }

    try {
      const verified = jwt.verify(verificationToken, process.env.JWT_SECRET);
      console.log(verified);

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now log in.",
      });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Generate new token
        const newToken = await generateToken(
          { userId: user._id },
          process.env.JWT_SECRET
        );
        user.verificationToken = newToken;
        await user.save();

        return next(
          createHttpError(
            400,
            "Verification link expired. A new one has been sent to your email."
          )
        );
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    if (user.isVerified) {
      return next(createHttpError(400, "User is already verified"));
    }

    // Generate new verification token
    const verificationToken = await generateToken(
      { userId: user._id },
      process.env.JWT_SECRET
    );

    // Update user with new token
    user.verificationToken = verificationToken;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      status: "success",
      message: "Verification email has been resent. Please check your inbox.",
    });
  } catch (error) {
    next(
      createHttpError(
        500,
        `Problem resending verification email: ${error.message}`
      )
    );
  }
};
