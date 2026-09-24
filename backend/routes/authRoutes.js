const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');

// Helper functions for secure password hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;
  // If stored as salt:hash
  if (storedPassword.includes(':')) {
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }
  // Legacy plaintext fallback
  return password === storedPassword;
}

// 1. Genuine Registration (Sign Up)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, cpse_organization, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.password) {
      return res.status(400).json({ 
        error: 'An account with this email already exists. Please go to the Sign In tab and enter your password.' 
      });
    }

    const hashedPassword = hashPassword(password);

    if (existingUser) {
      // Update existing record with password and details
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.cpse_organization = cpse_organization || 'ONGC';
      existingUser.designation = designation || 'Procurement Officer';
      existingUser.auth_provider = 'local';
      if (req.body.role) existingUser.role = req.body.role;
      existingUser.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563EB`;
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: 'Account registered successfully',
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role || 'officer',
          cpse_organization: existingUser.cpse_organization,
          designation: existingUser.designation,
          avatar: existingUser.avatar
        }
      });
    }

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: req.body.role || 'officer',
      cpse_organization: cpse_organization || 'ONGC',
      designation: designation || 'Procurement Officer',
      auth_provider: 'local',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563EB`
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || 'officer',
        cpse_organization: newUser.cpse_organization,
        designation: newUser.designation,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 2. Genuine Login (Sign In) - Strict Password Verification
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both your email address and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ 
        error: 'No account registered with this email. Please click "Create Account (Sign Up)" above to register first.' 
      });
    }

    if (!user.password) {
      return res.status(401).json({ 
        error: 'No password set for this account. Please click "Create Account (Sign Up)" to set a password.' 
      });
    }

    // STRICT PASSWORD VERIFICATION
    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Incorrect password. Access denied.' 
      });
    }

    // Password verified!
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'officer',
        cpse_organization: user.cpse_organization,
        designation: user.designation,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

module.exports = router;
