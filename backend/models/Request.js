const prisma = require('../config/prisma');

// Prisma Request model proxy
module.exports = prisma.request;
