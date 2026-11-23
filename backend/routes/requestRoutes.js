const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', authorize('receiver', 'admin'), createRequest);
router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.put('/:id', updateRequestStatus);

module.exports = router;
