const mongoose = require('mongoose');

const UserAvatarSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    immutable: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const UserAvatar = mongoose.model('UserAvatar', UserAvatarSchema);

module.exports = { UserAvatar };
