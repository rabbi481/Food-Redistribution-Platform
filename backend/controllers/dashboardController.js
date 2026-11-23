const prisma = require('../config/prisma');
const { formatDonation, formatRequest } = require('../utils/formatters');
const { checkAndExpireDonations } = require('../utils/expiryChecker');

// @desc    Get comprehensive dashboard and platform statistics from real PostgreSQL data
// @route   GET /api/dashboard/stats
// @access  Public / Private
const getStats = async (req, res, next) => {
  try {
    await checkAndExpireDonations();

    // 1. User stats
    const [
      totalUsers,
      donorsCount,
      receiversCount,
      volunteersCount,
      adminsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'donor' } }),
      prisma.user.count({ where: { role: 'receiver' } }),
      prisma.user.count({ where: { role: 'volunteer' } }),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);

    // 2. Donation stats
    const [
      totalDonations,
      activeDonations,
      completedDonations,
      expiredDonations,
      quantityAgg,
    ] = await Promise.all([
      prisma.donation.count(),
      prisma.donation.count({
        where: { status: { in: ['available', 'partially_claimed'] } },
      }),
      prisma.donation.count({ where: { status: 'completed' } }),
      prisma.donation.count({ where: { status: 'expired' } }),
      prisma.donation.aggregate({
        _sum: { quantity: true },
      }),
    ]);

    const totalFoodQuantity = quantityAgg._sum.quantity || 0;

    // 3. Category distribution
    const categoryGroup = await prisma.donation.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { quantity: true },
    });

    const categoryStats = categoryGroup.map((c) => ({
      _id: c.category,
      count: c._count.id,
      totalQuantity: c._sum.quantity || 0,
    }));

    // 4. Request stats
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      deliveredRequests,
    ] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { status: 'pending' } }),
      prisma.request.count({ where: { status: 'approved' } }),
      prisma.request.count({ where: { status: 'delivered' } }),
    ]);

    // 5. Volunteer Task stats
    const [
      totalTasks,
      availableTasks,
      completedDeliveries,
      inProgressDeliveries,
    ] = await Promise.all([
      prisma.volunteerTask.count(),
      prisma.volunteerTask.count({ where: { status: 'available' } }),
      prisma.volunteerTask.count({ where: { status: 'delivered' } }),
      prisma.volunteerTask.count({
        where: { status: { in: ['assigned', 'picked_up', 'in_transit'] } },
      }),
    ]);

    // 6. Recent Activity
    const [recentDonations, recentRequests] = await Promise.all([
      prisma.donation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { donor: true },
      }),
      prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { receiver: true, donation: true },
      }),
    ]);

    // 7. User-specific stats if authenticated
    let userStats = null;
    if (req.user) {
      if (req.user.role === 'donor') {
        const [
          myDonations,
          myActiveDonations,
          myCompletedDonations,
          myIncomingRequests,
        ] = await Promise.all([
          prisma.donation.count({ where: { donorId: req.user.id } }),
          prisma.donation.count({
            where: {
              donorId: req.user.id,
              status: { in: ['available', 'partially_claimed'] },
            },
          }),
          prisma.donation.count({
            where: { donorId: req.user.id, status: 'completed' },
          }),
          prisma.request.count({
            where: {
              donation: { donorId: req.user.id },
              status: 'pending',
            },
          }),
        ]);

        userStats = {
          myDonations,
          myActiveDonations,
          myCompletedDonations,
          myIncomingRequests,
        };
      } else if (req.user.role === 'receiver') {
        const [myRequests, myPending, myDelivered] = await Promise.all([
          prisma.request.count({ where: { receiverId: req.user.id } }),
          prisma.request.count({
            where: { receiverId: req.user.id, status: 'pending' },
          }),
          prisma.request.count({
            where: { receiverId: req.user.id, status: 'delivered' },
          }),
        ]);

        userStats = {
          myRequests,
          myPending,
          myDelivered,
        };
      } else if (req.user.role === 'volunteer') {
        const [myAssignedTasks, myCompletedDeliveries] = await Promise.all([
          prisma.volunteerTask.count({
            where: {
              volunteerId: req.user.id,
              status: { in: ['assigned', 'picked_up', 'in_transit'] },
            },
          }),
          prisma.volunteerTask.count({
            where: { volunteerId: req.user.id, status: 'delivered' },
          }),
        ]);

        userStats = {
          myAssignedTasks,
          myCompletedDeliveries,
          availableToAccept: availableTasks,
        };
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          donors: donorsCount,
          receivers: receiversCount,
          volunteers: volunteersCount,
          admins: adminsCount,
        },
        donations: {
          total: totalDonations,
          active: activeDonations,
          completed: completedDonations,
          expired: expiredDonations,
          totalQuantity: totalFoodQuantity,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          delivered: deliveredRequests,
        },
        deliveries: {
          total: totalTasks,
          available: availableTasks,
          completed: completedDeliveries,
          inProgress: inProgressDeliveries,
        },
        categories: categoryStats,
        recentActivity: {
          donations: recentDonations.map(formatDonation),
          requests: recentRequests.map(formatRequest),
        },
        userStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
