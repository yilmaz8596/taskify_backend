import mongoose from "mongoose";

const priorityLevels = ["Extreme", "Moderate", "Low"];
const statusLevels = ["Pending", "In Progress", "Completed"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
      default: "",
    },

    objective: {
      type: String,
      trim: true,
      default: "",
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
      set: function (value) {
        if (typeof value === "string") {
          const [day, month, year] = value.split(".");
          return new Date(year, month - 1, day);
        }
        return value;
      },
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre("save", function (next) {
  if (typeof this.deadline === "string") {
    const [day, month, year] = this.deadline.split(".");
    this.deadline = new Date(year, month - 1, day);
  }
  next();
});

taskSchema.statics.addPriorityLevel = function (newLevel) {
  if (priorityLevels.includes(newLevel)) {
    throw new Error("Priority level already exists");
  }
  priorityLevels.push(newLevel);
  this.path("priority").enum = priorityLevels;
};

taskSchema.statics.editPriorityLevel = function (oldLevel, newLevel) {
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

taskSchema.statics.deletePriorityLevel = function (level) {
  if (!priorityLevels.includes(level)) {
    throw new Error("Priority level does not exist");
  }

  const index = priorityLevels.findIndex((l) => l === level);
  priorityLevels.splice(index, 1);
  this.path("priority").enum = priorityLevels;
};

taskSchema.statics.addStatusLevel = function (newLevel) {
  if (statusLevels.includes(newLevel)) {
    throw new Error("Status level already exists");
  }
  statusLevels.push(newLevel);
  this.path("status").enum = statusLevels;
};

taskSchema.statics.editStatusLevel = function (oldLevel, newLevel) {
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

taskSchema.statics.deleteStatusLevel = function (level) {
  if (!statusLevels.includes(level)) {
    throw new Error("Status level does not exist");
  }

  const index = statusLevels.findIndex((l) => l === level);
  statusLevels.splice(index, 1);
  this.path("status").enum = statusLevels;
};

taskSchema.statics.addNewAdditionalNote = function (note) {
  this.path("additionalNotes").default.push(note);
};

taskSchema.statics.deleteAdditionalNote = function (note) {
  const index = this.path("additionalNotes").default.findIndex(
    (n) => n === note
  );
  this.path("additionalNotes").default.splice(index, 1);
};

taskSchema.statics.editDeadline = function (newDeadline) {
  this.path("deadline").default = newDeadline;
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
