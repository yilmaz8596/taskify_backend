// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
    },
    githubId: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "github"],
      default: "local",
    },
    firstname: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      trim: true,
    },
    lastname: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      trim: true,
    },
    username: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
