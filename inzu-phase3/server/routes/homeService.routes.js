const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/homeService.controller');
const { protect } = require('../middleware/auth.middleware');
const upload  = require('../config/cloudinary');

// Public
router.get('/',                     ctrl.getServices);
router.get('/requests/my',          protect, ctrl.getMyRequests);
router.get('/:id',                  ctrl.getService);

// Protected
router.post('/',                    protect, upload.array('images', 8), ctrl.createService);
router.post('/:serviceId/request',  protect, upload.array('images', 5), ctrl.createRequest);
router.patch('/requests/:requestId/status', protect, ctrl.updateRequestStatus);
router.post('/requests/:requestId/review',  protect, ctrl.leaveReview);

module.exports = router;
