const prisma = require('../config/prisma');

/**
 * Checks and updates food listings that have passed their expiry date in PostgreSQL.
 * Marks status as 'expired'.
 */
const checkAndExpireDonations = async () => {
  try {
    const now = new Date();
    const result = await prisma.donation.updateMany({
      where: {
        status: { in: ['available', 'partially_claimed'] },
        expiryDate: { lt: now },
      },
      data: {
        status: 'expired',
      },
    });

    if (result.count > 0) {
      console.log(`Auto-expired ${result.count} food donation listing(s) in PostgreSQL.`);
    }
    return result;
  } catch (error) {
    // If DB is offline, log gracefully
    console.warn('Auto-expire check warning:', error.message);
  }
};

module.exports = { checkAndExpireDonations };
