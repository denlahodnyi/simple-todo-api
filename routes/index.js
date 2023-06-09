const express = require('express');
const { resendVerifyLimiter } = require('../middlewares/rateLimiters');
const { authMw } = require('../middlewares/authMiddleware');

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

const router = express.Router();

router.route('/tasks/').get(authMw(), getAllTasks).post(authMw(), createTask);
router
  .route('/tasks/:task_id')
  .get(authMw(), getTask)
  .put(authMw(), updateTask)
  .delete(authMw(), deleteTask);

router.route('/users/').get(authMw({ publicLike: true }), getAllUsers);
router
  .route('/users/:user_id')
  .get(authMw({ publicLike: true }), getUser)
  .patch(authMw(), updateUser)
  .delete(authMw(), deleteUser);
router.route('/users/:user_id/password').patch(authMw(), updateUserPassword);

router.route('/auth/signin').post(signin);
router.route('/auth/signup').post(signup);
router.route('/auth/verify').get(verify);
router.route('/auth/send-verify').post(resendVerifyLimiter, resendVerify);

module.exports = router;
