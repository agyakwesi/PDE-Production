const express = require('express');
const router = express.Router();
const { getUsers, getCurrentUser } = require('../controllers/userController');

router.route('/').get(getUsers);
router.route('/me').get(getCurrentUser);

module.exports = router;
