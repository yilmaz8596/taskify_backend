import mongoose from "mongoose";

const priorityLevels = ["Extreme", "Moderate", "Low"];
const statusLevels = ["Pending", "In Progress", "Completed"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      required: true,
      trim: true,
    },

    objective: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: [
      {
        priority: {
          type: String,
          enum: priorityLevels,
          default: "Low",
          required: true,
        },
        status: {
          type: String,
          enum: statusLevels,
          default: "Pending",
          required: true,
        },
        additionalFields: {
          type: Map,
          of: String,
        },
      },
    ],

    additionalNotes: {
      type: [String],
      trim: true,
      default: [],
    },
    deadline: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

Task.statics.addPriorityLevel = function (newLevel) {
  if (priorityLevels.includes(newLevel)) {
    throw new Error("Priority level already exists");
  }
  priorityLevels.push(newLevel);
  this.path("priority").enum = priorityLevels;
};

Task.statics.editPriorityLevel = function (oldLevel, newLevel) {
  if (!priorityLevels.includes(oldLevel)) {
    throw new Error("Priority level does not exist");
  }

  if (priorityLevels.includes(newLevel)) {
    throw new Error("Priority level already exists");
  }

  const index = priorityLevels.findIndex((level) => level === oldLevel);
  priorityLevels[index] = newLevel;
  this.path("priority").enum = priorityLevels;
};

Task.statics.deletePriorityLevel = function (level) {
  if (!priorityLevels.includes(level)) {
    throw new Error("Priority level does not exist");
  }

  const index = priorityLevels.findIndex((l) => l === level);
  priorityLevels.splice(index, 1);
  this.path("priority").enum = priorityLevels;
};

Task.statics.addStatusLevel = function (newLevel) {
  if (statusLevels.includes(newLevel)) {
    throw new Error("Status level already exists");
  }
  statusLevels.push(newLevel);
  this.path("status").enum = statusLevels;
};

Task.statics.editStatusLevel = function (oldLevel, newLevel) {
  if (!statusLevels.includes(oldLevel)) {
    throw new Error("Status level does not exist");
  }

  if (statusLevels.includes(newLevel)) {
    throw new Error("Status level already exists");
  }

  const index = statusLevels.findIndex((level) => level === oldLevel);
  statusLevels[index] = newLevel;
  this.path("status").enum = statusLevels;
};

Task.statics.deleteStatusLevel = function (level) {
  if (!statusLevels.includes(level)) {
    throw new Error("Status level does not exist");
  }

  const index = statusLevels.findIndex((l) => l === level);
  statusLevels.splice(index, 1);
  this.path("status").enum = statusLevels;
};

Task.statics.addNewAdditionalNote = function (note) {
  this.path("additionalNotes").default.push(note);
};

Task.statics.deleteAdditionalNote = function (note) {
  const index = this.path("additionalNotes").default.findIndex(
    (n) => n === note
  );
  this.path("additionalNotes").default.splice(index, 1);
};

Task.statics.editDeadline = function (newDeadline) {
  this.path("deadline").default = newDeadline;
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
