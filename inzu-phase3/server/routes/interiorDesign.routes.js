const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/interiorDesign.controller');
const { protect } = require('../middleware/auth.middleware');
const upload  = require('../config/cloudinary');

// Public
router.get('/',                                 ctrl.getProjects);
router.get('/designers',                        ctrl.getDesigners);
router.get('/requests/my',  protect,            ctrl.getMyRequests);
router.get('/:id',                              ctrl.getProject);

// Protected
router.post('/',            protect, upload.fields([
  { name: 'after',     maxCount: 10 },
  { name: 'before',    maxCount: 10 },
  { name: 'moodBoard', maxCount: 6  },
]), ctrl.createProject);

router.post('/:designerId/request',  protect, upload.array('referenceImages', 6), ctrl.createRequest);
router.patch('/requests/:requestId', protect, ctrl.updateRequest);

module.exports = router;
