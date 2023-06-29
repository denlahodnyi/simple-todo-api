const express = require('express');
const path = require('path');
const multer = require('multer');
const { customAlphabet } = require('nanoid');

const { resendVerifyLimiter } = require('../middlewares/rateLimiters');
const { authMw } = require('../middlewares/authMiddleware');

const {
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
} = require('../controllers/tasks');
const {
  deleteUser,
  getAllUsers,
  getUser,
  getUserAvatar,
  resetPassword,
  updateUser,
  updateUserAvatar,
  updateUserPassword,
} = require('../controllers/users');
const { signin, signup, verify, resendVerify } = require('../controllers/auth');

const { BadRequestError } = require('../utils');

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  16
);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const uniqueSuffix = nanoid();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const router = express.Router();
const avatarUpload = multer({
  storage,
  limits: { fileSize: 2097152 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ext = `.${file.mimetype.split('/')[1]}`;
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    if (allowedExtensions.some((e) => e === ext)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Allowed file extensions: ${allowedExtensions.join(', ')}`
        )
      );
    }
  },
});

// Tasks routes
router.route('/tasks/').get(authMw(), getAllTasks).post(authMw(), createTask);
router
  .route('/tasks/:task_id')
  .get(authMw(), getTask)
  .put(authMw(), updateTask)
  .delete(authMw(), deleteTask);

// Users routes
router.route('/users/').get(authMw({ publicLike: true }), getAllUsers);
router
  .route('/users/:user_id')
  .get(authMw({ publicLike: true }), getUser)
  .patch(authMw(), updateUser)
  .delete(authMw(), deleteUser);
router.route('/users/:user_id/password').patch(authMw(), updateUserPassword);

// Avatars routes
router.route('/users/:user_id/avatars/:avatar_id').get(getUserAvatar);
router
  .route('/users/:user_id/avatars/upload')
  .put(authMw(), avatarUpload.single('avatar'), updateUserAvatar);

// Password reset
router.route('/password-reset').post(resetPassword);

// Registration routes
router.route('/auth/signin').post(signin);
router.route('/auth/signup').post(signup);
router.route('/auth/verify').get(verify);
router.route('/auth/send-verify').post(resendVerifyLimiter, resendVerify);

module.exports = router;
