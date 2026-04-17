/**
 * Search routes — add to your main app.js
 * app.use('/api/search', searchRoutes);
 */
const express = require('express');
const router = express.Router();
const { search, suggestions } = require('../search.controller');
const { cacheMiddleware } = require('./middleware/cache.middleware');

// Cache search results for 2 minutes (fast-changing)
// Cache suggestions for 5 minutes
router.get('/', cacheMiddleware(120), search);
router.get('/suggestions', cacheMiddleware(300), suggestions);

module.exports = router;
