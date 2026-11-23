const express = require('express');
const router = express.Router();
const {
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  updateTaskStatus,
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('volunteer', 'admin'));

router.get('/tasks', getAvailableTasks);
router.get('/my-tasks', getMyTasks);
router.post('/tasks/:id/accept', acceptTask);
router.put('/tasks/:id/status', updateTaskStatus);

module.exports = router;
