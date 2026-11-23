const prisma = require('../config/prisma');

let isDbConnected = null;
let lastCheckTime = 0;

const dbCheck = async (req, res, next) => {
  // Allow health check without DB
  if (req.path === '/api/health') {
    return next();
  }

  const now = Date.now();
  // Check every 5 seconds or on initial
  if (isDbConnected === null || now - lastCheckTime > 5000) {
    lastCheckTime = now;
    try {
      await prisma.$queryRaw`SELECT 1`;
      isDbConnected = true;
    } catch (err) {
      isDbConnected = false;
      console.warn('PostgreSQL Connection Warning:', err.message);
    }
  }

  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      isDbOffline: true,
      message: 'PostgreSQL database is currently not connected. Please ensure PostgreSQL is running and DATABASE_URL is correctly configured in backend/.env.',
    });
  }

  next();
};

module.exports = dbCheck;
