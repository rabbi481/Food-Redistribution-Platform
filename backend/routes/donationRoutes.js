const express = require('express');
const router = express.Router();
const {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
} = require('../controllers/donationController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public listing with filters, optional auth
router.get('/', optionalAuth, getAllDonations);

// My donations (must be before :id)
router.get('/my', protect, authorize('donor', 'admin'), getMyDonations);

// Single donation
router.get('/:id', optionalAuth, getDonationById);

// Protected routes (Donors and Admins)
router.post('/', protect, authorize('donor', 'admin'), createDonation);
router.put('/:id', protect, authorize('donor', 'admin'), updateDonation);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteDonation);

module.exports = router;
