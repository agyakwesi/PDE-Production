const express = require('express');
const router = express.Router();
const { getWardrobeAnalysis } = require('../controllers/wardrobeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analysis', protect, getWardrobeAnalysis);

module.exports = router;
