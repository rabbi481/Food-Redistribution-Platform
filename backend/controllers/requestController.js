const prisma = require('../config/prisma');
const { formatRequest, formatVolunteerTask } = require('../utils/formatters');
const { checkAndExpireDonations } = require('../utils/expiryChecker');

// @desc    Create a food request
// @route   POST /api/requests
// @access  Private (Receiver, Admin)
const createRequest = async (req, res, next) => {
  try {
    const {
      donationId,
      requestedQuantity,
      message,
      deliveryMethod,
      deliveryAddress,
      contactPhone,
    } = req.body;

    await checkAndExpireDonations();

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { donor: true },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Food donation listing not found',
      });
    }

    if (donation.status === 'expired' || new Date(donation.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This food donation has expired and cannot be requested for food safety reasons.',
      });
    }

    if (donation.status === 'completed' || donation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `This donation is no longer available (Status: ${donation.status}).`,
      });
    }

    const availableQty = donation.remainingQuantity;
    const reqQty = Number(requestedQuantity);

    if (reqQty > availableQty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${reqQty}) exceeds available quantity (${availableQty} ${donation.unit}).`,
      });
    }

    if (reqQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity must be at least 1.',
      });
    }

    // Check if receiver already has a pending request for this donation
    const existingPending = await prisma.request.findFirst({
      where: {
        donationId,
        receiverId: req.user.id,
        status: 'pending',
      },
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this donation. Please wait for the donor to review it.',
      });
    }

    const foodRequest = await prisma.request.create({
      data: {
        donationId,
        receiverId: req.user.id,
        requestedQuantity: reqQty,
        unit: donation.unit,
        message: message || '',
        deliveryMethod: deliveryMethod || 'volunteer_delivery',
        deliveryAddress:
          deliveryAddress ||
          req.user.address?.formattedAddress ||
          req.user.address?.street ||
          'Address provided upon approval',
        contactPhone: contactPhone || req.user.phone,
        status: 'pending',
      },
      include: {
        donation: { include: { donor: true } },
        receiver: true,
      },
    });

    res.status(201).json({
      success: true,
      request: formatRequest(foodRequest),
      message: 'Food donation request submitted successfully! Awaiting donor approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (filtered by user role)
// @route   GET /api/requests
// @access  Private
const getAllRequests = async (req, res, next) => {
  try {
    const { status, donationId } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (donationId) {
      where.donationId = donationId;
    }

    if (req.user.role === 'receiver') {
      where.receiverId = req.user.id;
    } else if (req.user.role === 'donor') {
      where.donation = { donorId: req.user.id };
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        donation: {
          include: { donor: true },
        },
        receiver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(formatRequest),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const foodRequest = await prisma.request.findUnique({
      where: { id: req.params.id },
      include: {
        donation: { include: { donor: true } },
        receiver: true,
      },
    });

    if (!foodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const isReceiver = foodRequest.receiverId === req.user.id;
    const isDonor = foodRequest.donation?.donorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isVolunteer = req.user.role === 'volunteer';

    if (!isReceiver && !isDonor && !isAdmin && !isVolunteer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request',
      });
    }

    res.status(200).json({
      success: true,
      request: formatRequest(foodRequest),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Approve, Reject, Cancel) using PostgreSQL Transaction
// @route   PUT /api/requests/:id
// @access  Private (Donor, Admin, Receiver for cancel)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const foodRequest = await prisma.request.findUnique({
      where: { id: req.params.id },
      include: {
        donation: true,
        receiver: true,
      },
    });

    if (!foodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    const isDonor = foodRequest.donation?.donorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isReceiver = foodRequest.receiverId === req.user.id;

    // Cancellation by receiver
    if (status === 'cancelled') {
      if (!isReceiver && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only the receiver or admin can cancel this request',
        });
      }

      const updated = await prisma.request.update({
        where: { id: req.params.id },
        data: { status: 'cancelled' },
        include: {
          donation: { include: { donor: true } },
          receiver: true,
        },
      });

      return res.status(200).json({
        success: true,
        request: formatRequest(updated),
        message: 'Request cancelled successfully',
      });
    }

    // Approval or Rejection by Donor or Admin
    if (!isDonor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the donor or admin can approve or reject this request',
      });
    }

    if (status === 'rejected') {
      const updated = await prisma.request.update({
        where: { id: req.params.id },
        data: {
          status: 'rejected',
          rejectionReason: rejectionReason || 'Request rejected by donor',
        },
        include: {
          donation: { include: { donor: true } },
          receiver: true,
        },
      });

      return res.status(200).json({
        success: true,
        request: formatRequest(updated),
        message: 'Request has been rejected',
      });
    }

    if (status === 'approved') {
      // Execute within PostgreSQL transaction to ensure atomic quantity deduction
      // and prevent race condition overbooking
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Fetch current donation row inside transaction
        const currentDonation = await tx.donation.findUnique({
          where: { id: foodRequest.donationId },
        });

        if (!currentDonation) {
          throw new Error('Associated donation listing not found');
        }

        if (currentDonation.remainingQuantity < foodRequest.requestedQuantity) {
          throw new Error(
            `Cannot approve request: only ${currentDonation.remainingQuantity} ${currentDonation.unit} remaining, but ${foodRequest.requestedQuantity} were requested.`
          );
        }

        const newRemaining = currentDonation.remainingQuantity - foodRequest.requestedQuantity;
        const newDonationStatus = newRemaining === 0 ? 'reserved' : 'partially_claimed';

        // 1. Update donation quantity & status
        await tx.donation.update({
          where: { id: foodRequest.donationId },
          data: {
            remainingQuantity: newRemaining,
            status: newDonationStatus,
          },
        });

        // 2. Update request status to approved
        const approvedRequest = await tx.request.update({
          where: { id: foodRequest.id },
          data: { status: 'approved' },
          include: {
            donation: { include: { donor: true } },
            receiver: true,
          },
        });

        // 3. Create VolunteerTask if deliveryMethod is volunteer_delivery
        let createdTask = null;
        if (approvedRequest.deliveryMethod === 'volunteer_delivery') {
          createdTask = await tx.volunteerTask.create({
            data: {
              requestId: approvedRequest.id,
              donationId: currentDonation.id,
              pickupAddress: currentDonation.pickupAddress || 'Pickup address not specified',
              pickupContactPerson: req.user.name,
              pickupContactPhone: req.user.phone,
              pickupInstructions: currentDonation.pickupInstructions || '',
              deliveryAddress: approvedRequest.deliveryAddress || 'Delivery address not specified',
              deliveryRecipientName: approvedRequest.receiver?.organizationName || approvedRequest.receiver?.name || '',
              deliveryRecipientPhone: approvedRequest.contactPhone || approvedRequest.receiver?.phone || '',
              deliveryInstructions: approvedRequest.message || '',
              status: 'available',
            },
            include: {
              donation: { include: { donor: true } },
              request: { include: { receiver: true } },
            },
          });
        }

        return { approvedRequest, createdTask };
      });

      return res.status(200).json({
        success: true,
        request: formatRequest(transactionResult.approvedRequest),
        volunteerTask: transactionResult.createdTask
          ? formatVolunteerTask(transactionResult.createdTask)
          : null,
        message: 'Request approved successfully! Task created for volunteer pickup.',
      });
    }

    // Default status update
    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        donation: { include: { donor: true } },
        receiver: true,
      },
    });

    res.status(200).json({
      success: true,
      request: formatRequest(updated),
      message: `Request status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
};
