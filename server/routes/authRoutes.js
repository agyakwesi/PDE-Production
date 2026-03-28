const express = require('express');
const router = express.Router();
const { register, verifyEmail, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyEmail);

module.exports = router;
