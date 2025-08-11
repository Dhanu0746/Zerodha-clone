const User = require('../models/User');
const twoFactorService = require('../services/twoFactorService');
const jwt = require('jsonwebtoken');

// Setup 2FA - Generate secret and QR code
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled for this account' });
    }

    // Generate new secret
    const secretData = twoFactorService.generateSecret(user.email);
    
    // Generate QR code
    const qrCode = await twoFactorService.generateQRCode(secretData.otpauth_url);
    
    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secretData.secret;
    await user.save();

    res.json({
      message: '2FA setup initiated',
      qrCode,
      manualEntryKey: twoFactorService.formatSecretForManualEntry(secretData.secret),
      backupCodes: null // Will be generated after verification
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

// Verify and enable 2FA
exports.verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!twoFactorService.isValidTokenFormat(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'No 2FA setup in progress' });
    }

    // Verify the token
    const isValid = await twoFactorService.validateSetup(user.twoFactorSecret, token);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Generate backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorSetupComplete = true;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    // Return backup codes (only shown once)
    res.json({
      message: '2FA enabled successfully',
      backupCodes: backupCodes.map(bc => bc.code),
      remainingCodes: backupCodes.length
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

// Verify 2FA token during login
exports.verify2FALogin = async (req, res) => {
  try {
    const { email, token, isBackupCode = false } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      if (!twoFactorService.isValidBackupCodeFormat(token)) {
        return res.status(400).json({ error: 'Invalid backup code format' });
      }
      isValid = twoFactorService.verifyBackupCode(user.twoFactorBackupCodes, token);
      if (isValid) {
        await user.save(); // Save the used backup code
      }
    } else {
      // Verify TOTP token
      if (!twoFactorService.isValidTokenFormat(token)) {
        return res.status(400).json({ error: 'Invalid token format' });
      }
      isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0; // Reset failed attempts
    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        twoFactorEnabled: user.twoFactorEnabled
      },
      remainingBackupCodes: isBackupCode ? 
        twoFactorService.getRemainingBackupCodesCount(user.twoFactorBackupCodes) : 
        undefined
    });

  } catch (error) {
    console.error('2FA login verification error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { token, password } = req.body;
    const userId = req.user.userId;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify password (you'll need to implement password verification)
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(400).json({ error: 'Invalid password' });
    // }

    // Verify 2FA token
    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    user.twoFactorSetupComplete = false;
    await user.save();

    res.json({ message: '2FA disabled successfully' });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      twoFactorEnabled: user.twoFactorEnabled,
      setupComplete: user.twoFactorSetupComplete,
      remainingBackupCodes: user.twoFactorEnabled ? 
        twoFactorService.getRemainingBackupCodesCount(user.twoFactorBackupCodes) : 0,
      hasUnusedBackupCodes: user.twoFactorEnabled ? 
        twoFactorService.hasUnusedBackupCodes(user.twoFactorBackupCodes) : false
    });

  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
};

// Regenerate backup codes
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.userId;

    if (!twoFactorService.isValidTokenFormat(token)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify 2FA token
    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Generate new backup codes
    const newBackupCodes = twoFactorService.regenerateBackupCodes();
    user.twoFactorBackupCodes = newBackupCodes;
    await user.save();

    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: newBackupCodes.map(bc => bc.code),
      remainingCodes: newBackupCodes.length
    });

  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
};

// Get remaining backup codes count (for UI display)
exports.getBackupCodesInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    res.json({
      remainingCodes: twoFactorService.getRemainingBackupCodesCount(user.twoFactorBackupCodes),
      hasUnusedCodes: twoFactorService.hasUnusedBackupCodes(user.twoFactorBackupCodes),
      totalCodes: user.twoFactorBackupCodes.length
    });

  } catch (error) {
    console.error('Backup codes info error:', error);
    res.status(500).json({ error: 'Failed to get backup codes info' });
  }
};
