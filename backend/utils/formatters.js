/**
 * Formatters to ensure Prisma relational data maps seamlessly to the frontend
 * expectations while retaining pure relational structure in PostgreSQL.
 */

const formatUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    _id: user.id,
    id: user.id,
    address: {
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      formattedAddress: user.formattedAddress || `${user.street || ''} ${user.city || ''}`.trim() || 'Address not provided',
    },
  };
};

const formatDonation = (donation) => {
  if (!donation) return null;

  const formattedDonor = donation.donor ? formatUser(donation.donor) : donation.donorId;

  return {
    ...donation,
    _id: donation.id,
    id: donation.id,
    donorId: formattedDonor,
    pickupLocation: {
      street: donation.pickupStreet || '',
      city: donation.pickupCity || '',
      state: donation.pickupState || '',
      zipCode: donation.pickupZipCode || '',
      fullAddress: donation.pickupAddress || '',
      instructions: donation.pickupInstructions || '',
    },
    dietaryInfo: {
      isVegetarian: !!donation.isVegetarian,
      isVegan: !!donation.isVegan,
      isHalal: !!donation.isHalal,
      isGlutenFree: !!donation.isGlutenFree,
      containsAllergens: !!donation.containsAllergens,
      allergens: donation.allergens ? donation.allergens.split(',').filter(Boolean) : [],
    },
  };
};

const formatRequest = (reqItem) => {
  if (!reqItem) return null;

  return {
    ...reqItem,
    _id: reqItem.id,
    id: reqItem.id,
    donationId: reqItem.donation ? formatDonation(reqItem.donation) : reqItem.donationId,
    receiverId: reqItem.receiver ? formatUser(reqItem.receiver) : reqItem.receiverId,
  };
};

const formatVolunteerTask = (task) => {
  if (!task) return null;

  return {
    ...task,
    _id: task.id,
    id: task.id,
    donationId: task.donation ? formatDonation(task.donation) : task.donationId,
    requestId: task.request ? formatRequest(task.request) : task.requestId,
    volunteerId: task.volunteer ? formatUser(task.volunteer) : null,
    pickupLocation: {
      fullAddress: task.pickupAddress || '',
      contactPerson: task.pickupContactPerson || '',
      contactPhone: task.pickupContactPhone || '',
      instructions: task.pickupInstructions || '',
    },
    deliveryLocation: {
      fullAddress: task.deliveryAddress || '',
      recipientName: task.deliveryRecipientName || '',
      recipientPhone: task.deliveryRecipientPhone || '',
      instructions: task.deliveryInstructions || '',
    },
  };
};

module.exports = {
  formatUser,
  formatDonation,
  formatRequest,
  formatVolunteerTask,
};
