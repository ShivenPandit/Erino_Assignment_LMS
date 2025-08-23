const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for JWT token in HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('JWT token found in cookies:', !!token);
    } else {
      console.log('No JWT token found in cookies');
      console.log('Available cookies:', Object.keys(req.cookies || {}));
    }

    if (!token) {
      console.log('No JWT token provided, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No JWT token provided.'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for JWT token:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found for this token.'
        });
      }

      if (!user.isActive) {
        console.log('User account deactivated:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated.'
        });
      }

      console.log('User authenticated successfully via JWT:', user.email);
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.log('JWT verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired JWT token.'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: error.message
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid JWT token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize
};
