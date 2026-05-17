const express = require('express');
const router = express.Router();
const {
    setupUser,
    getStatus,
    fingerprintLogin,
    registerFingerprint,
    logoutUser,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', getStatus);
router.post('/setup', setupUser);
router.post('/fingerprint-login', fingerprintLogin);
router.post('/register-fingerprint', protect, registerFingerprint);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
