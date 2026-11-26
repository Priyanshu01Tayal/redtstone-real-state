const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'redstone_brokerage_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, licenseNumber, experienceYears, specialization } = req.body;

    // Disallow registering as admin directly from public form
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly. They must be provisioned through authorized backend operations.',
      });
    }

    const assignedRole = role || 'client';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      licenseNumber: assignedRole === 'broker' ? licenseNumber : '',
      experienceYears: assignedRole === 'broker' ? experienceYears : 0,
      specialization: assignedRole === 'broker' && specialization ? specialization : ['Residential', 'Commercial'],
    });

    await logAudit(req, 'USER_REGISTERED', 'User', user._id, { role: user.role, email: user.email });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    await logAudit(req, 'USER_LOGIN', 'User', user._id, { role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar, licenseNumber, experienceYears, specialization } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    if (user.role === 'broker') {
      if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
      if (experienceYears !== undefined) user.experienceYears = experienceYears;
      if (specialization) user.specialization = specialization;
    }

    await user.save();
    await logAudit(req, 'PROFILE_UPDATED', 'User', user._id);

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Seed / Demo accounts helper
// @route GET /api/auth/demo-accounts
exports.getDemoAccounts = (req, res) => {
  res.status(200).json({
    success: true,
    accounts: [
      { role: 'admin', email: 'admin@redstone.com', password: 'password123', label: 'Admin (System Master)' },
      { role: 'broker', email: 'vikram.broker@redstone.com', password: 'password123', label: 'In-House Broker (Senior)' },
      { role: 'owner', email: 'amit.owner@example.com', password: 'password123', label: 'Property Owner' },
      { role: 'client', email: 'priya.client@example.com', password: 'password123', label: 'Client / Buyer' },
    ],
  });
};
