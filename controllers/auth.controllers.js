import User from "../models/user.model.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

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
    await user.save();
    res.status(201).send({
      status: "success",
      message: "User created successfully",
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    throw createHttpError.InternalServerError(`
        Problem with creating a new user. ${error}
        `);
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
    const userExists = await User.findOne({
      username: new RegExp(`^${username}$`, "i"),
    });
    if (!userExists) {
      return next(createHttpError.NotFound("User does not exist"));
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return next(createHttpError.Unauthorized("Invalid credentials"));
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
