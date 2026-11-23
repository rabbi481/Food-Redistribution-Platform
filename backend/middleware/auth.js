const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { formatUser } = require('../utils/formatters');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_foodbridge_jwt_key_2026_secure'
      );

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended. Please contact platform administrators.',
        });
      }

      req.user = formatUser(user);
      next();
    } catch (error) {
      console.error('Auth protect error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }
};

// Optional auth: populate req.user if token is present, but don't reject if not
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_foodbridge_jwt_key_2026_secure'
      );
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (user && user.status !== 'suspended') {
        req.user = formatUser(user);
      }
    } catch (err) {
      // Ignore token error for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
