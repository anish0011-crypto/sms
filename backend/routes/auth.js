const express = require('express');
const router = express.Router();
const { login, registerStudent, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register-student', registerStudent);
router.post('/setup', require('../controllers/authController').setupInitialAccounts);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
