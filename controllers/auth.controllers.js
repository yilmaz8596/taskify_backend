import User from "../models/user.model.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
export const createUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      next(createHttpError.Conflict("User already exists"));
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
