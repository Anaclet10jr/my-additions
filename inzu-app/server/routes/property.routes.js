const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
} = require('../controllers/property.controller');

// Public routes
router.get('/',    getProperties);
router.get('/:id', getProperty);

// Owner or admin — create with up to 8 images
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 8),
  createProperty
);

// Owner of property or admin
router.put('/:id',    protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

// Admin only — approve a pending listing
router.patch('/:id/approve', protect, authorize('admin'), approveProperty);

module.exports = router;
