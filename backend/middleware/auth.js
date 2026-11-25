const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redstone_brokerage_super_secret_jwt_key_2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact administrator.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Optional protect for public routes that might personalize if token is passed
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'redstone_brokerage_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public routes
    }
  }
  next();
};

module.exports = { protect, optionalProtect };
