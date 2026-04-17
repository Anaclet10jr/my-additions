const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAnalytics,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllProperties,
  approveProperty,
  rejectProperty,
  deleteProperty,
  getAllBookings,
} = require('../controllers/admin.controller');

// All admin routes require login + admin role
router.use(protect, authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get('/users',              getUsers);
router.patch('/users/:id/role',   updateUserRole);
router.delete('/users/:id',       deleteUser);

// Properties
router.get('/properties',                  getAllProperties);
router.patch('/properties/:id/approve',    approveProperty);
router.patch('/properties/:id/reject',     rejectProperty);
router.delete('/properties/:id',           deleteProperty);

// Bookings
router.get('/bookings', getAllBookings);

module.exports = router;
