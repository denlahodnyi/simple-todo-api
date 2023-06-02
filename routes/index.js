const express = require('express');
const { resendVerifyLimiter } = require('../middlewares/rateLimiters');
const { authMw } = require('../middlewares/authMiddleware.js');

const router = express.Router();

const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/tasks');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserPassword,
} = require('../controllers/users');
const { signin, signup, verify, resendVerify } = require('../controllers/auth');

router.route('/tasks/').get(getAllTasks).post(createTask);
router.route('/tasks/:id').get(getTask).put(updateTask).delete(deleteTask);

router.route('/users/').get(authMw({ publicLike: true }), getAllUsers);
router
  .route('/users/:id')
  .get(authMw({ publicLike: true }), getUser)
  .patch(authMw(), updateUser)
  .delete(authMw(), deleteUser);
router.route('/users/:id/password').patch(authMw(), updateUserPassword);

router.route('/auth/signin').post(signin);
router.route('/auth/signup').post(signup);
router.route('/auth/verify').get(verify);
router.route('/auth/send-verify').post(resendVerifyLimiter, resendVerify);

module.exports = router;
