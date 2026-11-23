const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const prisma = require('./config/prisma');
const errorHandler = require('./middleware/errorHandler');
const dbCheck = require('./middleware/dbCheck');
const { checkAndExpireDonations } = require('./utils/expiryChecker');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Food Redistribution API (FoodBridge)',
    database: 'PostgreSQL with Prisma ORM',
    version: '2.0.0',
  });
});

// Database connectivity check for API routes
app.use('/api', dbCheck);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/volunteer', require('./routes/volunteerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handling middleware
app.use(errorHandler);

// Periodic auto-expiry check every 10 minutes
setInterval(() => {
  checkAndExpireDonations();
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`\n=================================================`);
  console.log(`🚀 FoodBridge Backend API running on port ${PORT}`);
  console.log(`🐘 Database: PostgreSQL with Prisma ORM`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================\n`);

  // Verify PostgreSQL connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Successfully connected to PostgreSQL via Prisma!`);
  } catch (err) {
    console.warn(
      `⚠️  NOTICE: Unable to connect to PostgreSQL at ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@') || 'not specified'}.\n` +
      `Ensure PostgreSQL service is running and DATABASE_URL in backend/.env is valid.`
    );
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('FoodBridge server shut down.');
    process.exit(0);
  });
});

module.exports = app;
