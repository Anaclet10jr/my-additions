const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  getAllBookings,
  cancelBooking,
} = require('../controllers/booking.controller');

// All booking routes require login
router.use(protect);

router.post('/:propertyId',                    createBooking);
router.get('/my',                              getMyBookings);
router.get('/property/:propertyId',            getPropertyBookings);
router.get('/',          authorize('admin'),   getAllBookings);
router.patch('/:id/cancel',                    cancelBooking);

module.exports = router;
