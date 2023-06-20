const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      immutable: true,
      default: null,
    },
    title: {
      type: String,
      index: {
        type: 'text',
      },
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
    color: {
      type: String,
      default: null,
      uppercase: true,
      match: [/^#([a-f0-9]{3}|[a-f0-9]{6})$/i, 'Must be a valid HEX color'],
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxLength: [20, 'Tag is too long'],
        },
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
