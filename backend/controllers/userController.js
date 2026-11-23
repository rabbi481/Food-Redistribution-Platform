const prisma = require('../config/prisma');
const { formatUser } = require('../utils/formatters');

// @desc    Get all users with search, role filter & pagination
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: Number(page),
      users: users.map(formatUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Self
const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user profile',
      });
    }

    const allowedUpdates = [
      'name',
      'phone',
      'organizationName',
      'organizationType',
      'bio',
      'profileImage',
    ];

    if (req.user.role === 'admin') {
      allowedUpdates.push('role', 'status', 'isVerified');
    }

    const updateData = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.address) {
      if (typeof req.body.address === 'string') {
        updateData.formattedAddress = req.body.address;
        updateData.street = req.body.address;
      } else if (typeof req.body.address === 'object') {
        if (req.body.address.street !== undefined) updateData.street = req.body.address.street;
        if (req.body.address.city !== undefined) updateData.city = req.body.address.city;
        if (req.body.address.state !== undefined) updateData.state = req.body.address.state;
        if (req.body.address.zipCode !== undefined) updateData.zipCode = req.body.address.zipCode;
        if (req.body.address.formattedAddress !== undefined) updateData.formattedAddress = req.body.address.formattedAddress;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      user: formatUser(updatedUser),
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to delete users',
      });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account',
      });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
