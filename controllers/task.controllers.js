import Task from "../models/task.model.js";
import createHttpError from "http-errors";
import User from "../models/user.model.js";

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      deadline,
      subtitle,
      objective,
      category = [
        {
          // Provide default category if none provided
          priority: "Low",
          status: "Pending",
        },
      ],
    } = req.body;
    const taskExists = await Task.findOne({ title });

    if (taskExists) {
      return next(createHttpError.Conflict("Task already exists"));
    }

    const [day, month, year] = deadline.split(".");
    const parsedDeadline = new Date(year, month - 1, day);

    console.log(req.user);

    const task = new Task({
      title,
      description,
      deadline: parsedDeadline,
      userID: req.user.id,
      subtitle,
      objective,
      category,
    });

    await task.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { tasks: task._id } },
      { new: true }
    );
    res.status(201).send({
      status: "success",
      message: "Task created successfully",
      task: {
        title: task.title,
        description: task.description,
        deadline: task.deadline,
      },
    });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, `An error occurred: ${error.message}`));
  }
};
