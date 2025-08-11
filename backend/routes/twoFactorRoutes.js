const express = require('express');
const router = express.Router();
const twoFactorController = require('../controller/twoFactorController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes (require authentication)
router.use(authMiddleware);

// Setup 2FA - Generate QR code and secret
router.post('/setup', twoFactorController.setup2FA);

// Verify 2FA setup and enable it
router.post('/verify-setup', twoFactorController.verify2FASetup);

// Get 2FA status for current user
router.get('/status', twoFactorController.get2FAStatus);

// Disable 2FA
router.post('/disable', twoFactorController.disable2FA);

// Regenerate backup codes
router.post('/regenerate-backup-codes', twoFactorController.regenerateBackupCodes);

// Get backup codes information
router.get('/backup-codes-info', twoFactorController.getBackupCodesInfo);

module.exports = router;
