const prisma = require('../config/prisma');
const { formatDonation } = require('../utils/formatters');
const { checkAndExpireDonations } = require('../utils/expiryChecker');

// @desc    Create a food donation
// @route   POST /api/donations
// @access  Private (Donor, Admin)
const createDonation = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      category,
      quantity,
      unit,
      foodImage,
      pickupLocation,
      pickupDate,
      expiryDate,
      dietaryInfo,
      storageRequirements,
    } = req.body;

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future. Cannot list expired food.',
      });
    }

    let pickupAddress = '';
    let pickupCity = '';
    let pickupState = '';
    let pickupZipCode = '';
    let pickupInstructions = '';

    if (typeof pickupLocation === 'string') {
      pickupAddress = pickupLocation;
    } else if (typeof pickupLocation === 'object' && pickupLocation !== null) {
      pickupAddress = pickupLocation.fullAddress || pickupLocation.street || req.user.address?.formattedAddress || 'Pickup address not specified';
      pickupCity = pickupLocation.city || req.user.address?.city || '';
      pickupState = pickupLocation.state || req.user.address?.state || '';
      pickupZipCode = pickupLocation.zipCode || req.user.address?.zipCode || '';
      pickupInstructions = pickupLocation.instructions || '';
    } else {
      pickupAddress = req.user.address?.formattedAddress || 'Pickup location not specified';
    }

    const validCategories = [
      'cooked_meals',
      'raw_ingredients',
      'bakery',
      'produce',
      'dairy',
      'canned_packaged',
      'beverages',
      'other',
    ];
    const assignedCategory = validCategories.includes(category) ? category : 'cooked_meals';

    const qty = Number(quantity);

    const donation = await prisma.donation.create({
      data: {
        donorId: req.user.id,
        foodName,
        description,
        category: assignedCategory,
        quantity: qty,
        remainingQuantity: qty,
        unit: unit || 'servings',
        foodImage:
          foodImage ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        pickupAddress,
        pickupCity,
        pickupState,
        pickupZipCode,
        pickupInstructions,
        pickupDate: new Date(pickupDate),
        expiryDate: new Date(expiryDate),
        isVegetarian: !!dietaryInfo?.isVegetarian,
        isVegan: !!dietaryInfo?.isVegan,
        isHalal: !!dietaryInfo?.isHalal,
        isGlutenFree: !!dietaryInfo?.isGlutenFree,
        containsAllergens: !!dietaryInfo?.containsAllergens,
        allergens: Array.isArray(dietaryInfo?.allergens)
          ? dietaryInfo.allergens.join(',')
          : dietaryInfo?.allergens || '',
        storageRequirements: storageRequirements || 'room_temperature',
        status: 'available',
      },
      include: {
        donor: true,
      },
    });

    res.status(201).json({
      success: true,
      donation: formatDonation(donation),
      message: 'Food donation listing created successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations with filters, search, pagination
// @route   GET /api/donations
// @access  Public / Private
const getAllDonations = async (req, res, next) => {
  try {
    await checkAndExpireDonations();

    const {
      search,
      category,
      status,
      city,
      isVegetarian,
      isHalal,
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    } else if (!status) {
      where.status = { in: ['available', 'partially_claimed'] };
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (city) {
      where.pickupCity = { contains: city, mode: 'insensitive' };
    }

    if (isVegetarian === 'true') {
      where.isVegetarian = true;
    }

    if (isHalal === 'true') {
      where.isHalal = true;
    }

    if (search) {
      where.OR = [
        { foodName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { pickupAddress: { contains: search, mode: 'insensitive' } },
        { pickupCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, donations] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        include: {
          donor: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      totalPages: Math.ceil(total / take),
      currentPage: Number(page),
      donations: donations.map(formatDonation),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donations listed by current donor
// @route   GET /api/donations/my
// @access  Private (Donor, Admin)
const getMyDonations = async (req, res, next) => {
  try {
    await checkAndExpireDonations();

    const donations = await prisma.donation.findMany({
      where: { donorId: req.user.id },
      include: { donor: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations: donations.map(formatDonation),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public / Private
const getDonationById = async (req, res, next) => {
  try {
    await checkAndExpireDonations();

    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: { donor: true },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation listing not found',
      });
    }

    res.status(200).json({
      success: true,
      donation: formatDonation(donation),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food donation
// @route   PUT /api/donations/:id
// @access  Private (Owner Donor or Admin)
const updateDonation = async (req, res, next) => {
  try {
    const existing = await prisma.donation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Food donation listing not found',
      });
    }

    if (existing.donorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation listing',
      });
    }

    if (req.body.expiryDate && new Date(req.body.expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future',
      });
    }

    const updateData = {};
    if (req.body.foodName) updateData.foodName = req.body.foodName;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.quantity) updateData.quantity = Number(req.body.quantity);
    if (req.body.remainingQuantity !== undefined) updateData.remainingQuantity = Number(req.body.remainingQuantity);
    if (req.body.unit) updateData.unit = req.body.unit;
    if (req.body.foodImage) updateData.foodImage = req.body.foodImage;
    if (req.body.storageRequirements) updateData.storageRequirements = req.body.storageRequirements;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.pickupDate) updateData.pickupDate = new Date(req.body.pickupDate);
    if (req.body.expiryDate) updateData.expiryDate = new Date(req.body.expiryDate);

    if (req.body.pickupLocation) {
      if (typeof req.body.pickupLocation === 'string') {
        updateData.pickupAddress = req.body.pickupLocation;
      } else if (typeof req.body.pickupLocation === 'object') {
        if (req.body.pickupLocation.fullAddress) updateData.pickupAddress = req.body.pickupLocation.fullAddress;
        if (req.body.pickupLocation.city) updateData.pickupCity = req.body.pickupLocation.city;
        if (req.body.pickupLocation.state) updateData.pickupState = req.body.pickupLocation.state;
        if (req.body.pickupLocation.zipCode) updateData.pickupZipCode = req.body.pickupLocation.zipCode;
        if (req.body.pickupLocation.instructions) updateData.pickupInstructions = req.body.pickupLocation.instructions;
      }
    }

    const updated = await prisma.donation.update({
      where: { id: req.params.id },
      data: updateData,
      include: { donor: true },
    });

    res.status(200).json({
      success: true,
      donation: formatDonation(updated),
      message: 'Donation listing updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food donation
// @route   DELETE /api/donations/:id
// @access  Private (Owner Donor or Admin)
const deleteDonation = async (req, res, next) => {
  try {
    const existing = await prisma.donation.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Food donation listing not found',
      });
    }

    if (existing.donorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation listing',
      });
    }

    await prisma.donation.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Food donation listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
};
