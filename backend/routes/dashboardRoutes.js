const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

router.get('/stats', optionalAuth, getStats);

module.exports = router;
