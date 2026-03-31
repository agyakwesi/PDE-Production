const express = require('express');
const router = express.Router();
const { getUsers, getCurrentUser, toggleFounderStatus, addExternalScent, removeExternalScent } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getUsers);
router.get('/me', protect, getCurrentUser);
router.post('/founder-status', protect, admin, toggleFounderStatus);
router.post('/external', protect, addExternalScent);
router.delete('/external/:scentId', protect, removeExternalScent);

module.exports = router;
