const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let sessionId;

    // Check for session ID in httpOnly cookie
    if (req.cookies && req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
      console.log('Session ID found in cookies:', !!sessionId);
    } else {
      console.log('No session ID found in cookies');
      console.log('Available cookies:', Object.keys(req.cookies || {}));
    }

    if (!sessionId) {
      console.log('No session ID provided, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No session ID provided.'
      });
    }

    try {
      // Get session data from memory
      const session = global.sessions && global.sessions.get(sessionId);
      
      if (!session) {
        console.log('Session not found or expired:', sessionId);
        return res.status(401).json({
          success: false,
          message: 'Session not found or expired.'
        });
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        console.log('Session expired:', sessionId);
        global.sessions.delete(sessionId);
        return res.status(401).json({
          success: false,
          message: 'Session expired.'
        });
      }

      // Get user from session
      const user = await User.findById(session.userId).select('-password');
      
      if (!user) {
        console.log('User not found for session:', session.userId);
        return res.status(401).json({
          success: false,
          message: 'User not found for this session.'
        });
      }

      if (!user.isActive) {
        console.log('User account deactivated:', session.userId);
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated.'
        });
      }

      console.log('User authenticated successfully via session:', user.email);
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.log('Session verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid session.'
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

// Optional authentication - doesn't fail if no session
const optionalAuth = async (req, res, next) => {
  try {
    let sessionId;

    if (req.cookies && req.cookies.sessionId) {
      sessionId = req.cookies.sessionId;
    }

    if (sessionId) {
      try {
        // Get session data from memory
        const session = global.sessions && global.sessions.get(sessionId);
        
        if (session && new Date() <= session.expiresAt) {
          const user = await User.findById(session.userId).select('-password');
          
          if (user && user.isActive) {
            req.user = user;
          }
        }
      } catch (error) {
        // Session is invalid, but we don't fail the request
        console.log('Invalid session in optional auth:', error.message);
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
