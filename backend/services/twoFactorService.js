const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TwoFactorService {
  constructor() {
    this.appName = 'Zerodha Clone';
    this.issuer = 'ZerodhaClone';
  }

  // Generate a new TOTP secret for user
  generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `${this.appName} (${userEmail})`,
      issuer: this.issuer,
      length: 32
    });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
      manual_entry_key: secret.base32
    };
  }

  // Generate QR code for the secret
  async generateQRCode(otpauth_url) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauth_url, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  verifyToken(secret, token, window = 1) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window, // Allow 1 step before/after for clock drift
        time: Math.floor(Date.now() / 1000)
      });
      return verified;
    } catch (error) {
      return false;
    }
  }

  // Generate backup recovery codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({
        code: code,
        used: false,
        createdAt: new Date()
      });
    }
    return codes;
  }

  // Verify backup code
  verifyBackupCode(userBackupCodes, inputCode) {
    const code = userBackupCodes.find(
      bc => bc.code.toLowerCase() === inputCode.toLowerCase() && !bc.used
    );
    
    if (code) {
      code.used = true;
      return true;
    }
    return false;
  }

  // Check if user has unused backup codes
  hasUnusedBackupCodes(userBackupCodes) {
    return userBackupCodes.some(code => !code.used);
  }

  // Get remaining backup codes count
  getRemainingBackupCodesCount(userBackupCodes) {
    return userBackupCodes.filter(code => !code.used).length;
  }

  // Generate new backup codes (invalidate old ones)
  regenerateBackupCodes(count = 10) {
    return this.generateBackupCodes(count);
  }

  // Validate TOTP setup
  async validateSetup(secret, token) {
    // Verify the token with a wider window for initial setup
    return this.verifyToken(secret, token, 2);
  }

  // Get current TOTP for testing (development only)
  getCurrentToken(secret) {
    if (process.env.NODE_ENV === 'development') {
      return speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });
    }
    throw new Error('getCurrentToken is only available in development');
  }

  // Format secret for manual entry
  formatSecretForManualEntry(secret) {
    // Add spaces every 4 characters for readability
    return secret.match(/.{1,4}/g).join(' ');
  }

  // Security helpers
  isValidTokenFormat(token) {
    // TOTP tokens are 6 digits
    return /^\d{6}$/.test(token);
  }

  isValidBackupCodeFormat(code) {
    // Backup codes are 8 character hex
    return /^[A-Fa-f0-9]{8}$/i.test(code);
  }

  // Rate limiting helper
  shouldRateLimit(attempts, timeWindow = 300000) { // 5 minutes
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => (now - attempt.timestamp) < timeWindow
    );
    return recentAttempts.length >= 5; // Max 5 attempts per 5 minutes
  }
}

module.exports = new TwoFactorService();
