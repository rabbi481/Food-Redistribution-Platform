const prisma = require('../config/prisma');
const { formatVolunteerTask } = require('../utils/formatters');

// @desc    Get all available delivery tasks
// @route   GET /api/volunteer/tasks
// @access  Private (Volunteer, Admin)
const getAvailableTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.volunteerTask.findMany({
      where: { status: 'available' },
      include: {
        donation: { include: { donor: true } },
        request: { include: { receiver: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks: tasks.map(formatVolunteerTask),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my assigned tasks
// @route   GET /api/volunteer/my-tasks
// @access  Private (Volunteer, Admin)
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.volunteerTask.findMany({
      where: { volunteerId: req.user.id },
      include: {
        donation: { include: { donor: true } },
        request: { include: { receiver: true } },
        volunteer: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks: tasks.map(formatVolunteerTask),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a delivery task
// @route   POST /api/volunteer/tasks/:id/accept
// @access  Private (Volunteer, Admin)
const acceptTask = async (req, res, next) => {
  try {
    const task = await prisma.volunteerTask.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Delivery task not found',
      });
    }

    if (task.status !== 'available' && task.volunteerId) {
      return res.status(400).json({
        success: false,
        message: 'This delivery task has already been accepted by another volunteer',
      });
    }

    const updatedTask = await prisma.volunteerTask.update({
      where: { id: req.params.id },
      data: {
        volunteerId: req.user.id,
        status: 'assigned',
        assignedAt: new Date(),
      },
      include: {
        donation: { include: { donor: true } },
        request: { include: { receiver: true } },
        volunteer: true,
      },
    });

    // Update associated request status
    await prisma.request.update({
      where: { id: task.requestId },
      data: { status: 'assigned' },
    });

    res.status(200).json({
      success: true,
      task: formatVolunteerTask(updatedTask),
      message: 'Delivery task accepted successfully! Ready for pickup.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery task status (picked_up, in_transit, delivered)
// @route   PUT /api/volunteer/tasks/:id/status
// @access  Private (Volunteer, Admin)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const task = await prisma.volunteerTask.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Delivery task not found',
      });
    }

    if (
      task.volunteerId &&
      task.volunteerId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date();
      await prisma.request.update({
        where: { id: task.requestId },
        data: { status: 'picked_up' },
      });
    } else if (status === 'in_transit') {
      await prisma.request.update({
        where: { id: task.requestId },
        data: { status: 'in_transit' },
      });
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      await prisma.request.update({
        where: { id: task.requestId },
        data: { status: 'delivered' },
      });

      // Check if donation should be marked completed
      const donation = await prisma.donation.findUnique({
        where: { id: task.donationId },
      });

      if (donation && (donation.remainingQuantity === 0 || donation.status === 'reserved')) {
        await prisma.donation.update({
          where: { id: donation.id },
          data: { status: 'completed' },
        });
      }
    }

    const updatedTask = await prisma.volunteerTask.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        donation: { include: { donor: true } },
        request: { include: { receiver: true } },
        volunteer: true,
      },
    });

    res.status(200).json({
      success: true,
      task: formatVolunteerTask(updatedTask),
      message: `Delivery status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  updateTaskStatus,
};
