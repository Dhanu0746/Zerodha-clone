const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to too many failed attempts',
        lockUntil: user.lockUntil 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      
      await user.save();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful password verification
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Don't generate full JWT yet, just return 2FA required status
      await user.save();
      
      return res.json({
        message: '2FA verification required',
        requires2FA: true,
        email: user.email,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          twoFactorEnabled: true
        }
      });
    }

    // No 2FA required, generate full JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
