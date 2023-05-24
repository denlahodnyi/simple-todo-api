const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
      maxLength: [35, 'Title is too long'],
    },
    description: {
      type: String,
      default: null,
      maxLength: [200, 'Description is too long'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    tag_color: {
      type: String,
      default: null,
      uppercase: true,
      match: [/^#([a-f0-9]{3}|[a-f0-9]{6})$/i, 'Must be a valid HEX color'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
