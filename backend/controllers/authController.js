const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { formatUser } = require('../utils/formatters');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_foodbridge_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      role,
      organizationName,
      organizationType,
      bio,
      profileImage,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number',
      });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Format address
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';
    let formattedAddress = '';

    if (typeof address === 'string') {
      formattedAddress = address;
      street = address;
    } else if (typeof address === 'object' && address !== null) {
      street = address.street || '';
      city = address.city || '';
      state = address.state || '';
      zipCode = address.zipCode || '';
      formattedAddress = address.formattedAddress || `${street} ${city}`.trim();
    }

    const validRoles = ['donor', 'receiver', 'volunteer', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'donor';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        role: assignedRole,
        organizationName: organizationName || '',
        organizationType: organizationType || 'Individual',
        bio: bio || '',
        profileImage:
          profileImage ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        street,
        city,
        state,
        zipCode,
        formattedAddress,
        status: 'active',
        isVerified: false,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both an email and password',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.organizationName !== undefined) updateData.organizationName = req.body.organizationName;
    if (req.body.organizationType !== undefined) updateData.organizationType = req.body.organizationType;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.profileImage !== undefined) updateData.profileImage = req.body.profileImage;

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
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      user: formatUser(updatedUser),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
