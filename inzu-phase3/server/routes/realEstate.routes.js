const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/realEstate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload  = require('../config/cloudinary');   // multer-cloudinary instance

// Public
router.get('/',          ctrl.getListings);
router.get('/my',        protect, ctrl.getMyListings);
router.get('/:id',       ctrl.getListing);

// Protected
router.post('/',                    protect, upload.array('images', 10), ctrl.createListing);
router.put('/:id',                  protect, upload.array('images', 10), ctrl.updateListing);
router.delete('/:id',               protect, ctrl.deleteListing);
router.post('/:id/inquiry',         protect, ctrl.sendInquiry);

module.exports = router;
