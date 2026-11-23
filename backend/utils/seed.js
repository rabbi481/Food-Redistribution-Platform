const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const prisma = require('../config/prisma');

dotenv.config({ path: `${__dirname}/../.env` });

const seedData = async () => {
  try {
    console.log(`Connecting to PostgreSQL via Prisma for seeding...`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')}`);

    // Test connection
    await prisma.$queryRaw`SELECT 1`;

    console.log('Clearing existing PostgreSQL database records...');
    await prisma.volunteerTask.deleteMany({});
    await prisma.request.deleteMany({});
    await prisma.donation.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Creating demo users with hashed passwords for all 4 roles...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    // 1. Create Users
    const donor1 = await prisma.user.create({
      data: {
        name: 'Elena Rostova',
        email: 'donor@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 234-5678',
        role: 'donor',
        organizationName: 'Fresh Bites Artisan Bistro',
        organizationType: 'Restaurant',
        street: '452 Pine Street, Downtown',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        formattedAddress: '452 Pine Street, Downtown, San Francisco, CA 94104',
        bio: 'Farm-to-table bistro committed to zero food waste and fresh local community meal sharing.',
        profileImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const donor2 = await prisma.user.create({
      data: {
        name: 'Marcus Vance',
        email: 'greenmarket@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 345-6789',
        role: 'donor',
        organizationName: 'Green Valley Organic Supermarket',
        organizationType: 'Supermarket',
        street: '880 Market Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        formattedAddress: '880 Market Blvd, San Francisco, CA 94102',
        bio: 'Supermarket providing daily surplus fresh produce, bakery, and packaged staples.',
        profileImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const receiver1 = await prisma.user.create({
      data: {
        name: 'Sister Mary Teresa',
        email: 'receiver@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 678-1234',
        role: 'receiver',
        organizationName: 'Hope Community Kitchen & Shelter',
        organizationType: 'NGO',
        street: '120 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        formattedAddress: '120 Mission Street, San Francisco, CA 94105',
        bio: 'Serving over 350 warm nutritious meals daily to unhoused community members and low-income families.',
        profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const receiver2 = await prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'shelter@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 789-2345',
        role: 'receiver',
        organizationName: 'Sunrise Family Crisis Center',
        organizationType: 'Shelter',
        street: '340 6th Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        formattedAddress: '340 6th Street, San Francisco, CA 94103',
        bio: 'Providing emergency shelter, pantry relief, and childcare nutrition programs.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const volunteer1 = await prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: 'volunteer@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 890-3456',
        role: 'volunteer',
        street: '722 Valencia St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        formattedAddress: '722 Valencia St, San Francisco, CA 94110',
        bio: 'Passionate urban cyclist and weekend van courier rescuing food across the Bay Area.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const volunteer2 = await prisma.user.create({
      data: {
        name: 'Sarah Jenkins',
        email: 'sarah.v@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 901-4567',
        role: 'volunteer',
        street: '150 Castro St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94114',
        formattedAddress: '150 Castro St, San Francisco, CA 94114',
        bio: 'Food rescue volunteer and logistics coordinator.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        name: 'Arthur Pendelton',
        email: 'admin@foodbridge.org',
        password: hashedPassword,
        phone: '+1 (555) 123-4567',
        role: 'admin',
        organizationName: 'FoodBridge Operations HQ',
        organizationType: 'Other',
        street: '100 Montgomery St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        formattedAddress: '100 Montgomery St, Suite 1400, San Francisco, CA 94104',
        bio: 'Chief Operations Coordinator overseeing regional food redistribution logistics and safety compliance.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        status: 'active',
        isVerified: true,
      },
    });

    console.log('Seeding rich food donation listings into PostgreSQL...');
    const now = new Date();
    const futureDate = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);

    const donation1 = await prisma.donation.create({
      data: {
        donorId: donor1.id,
        foodName: 'Fresh Mediterranean Pasta Trays & Roasted Vegetables',
        description: 'Large trays of freshly prepared penne with sun-dried tomato pesto, grilled zucchini, bell peppers, and fresh herbs. Prepared in commercial kitchen following HACCP guidelines.',
        category: 'cooked_meals',
        quantity: 45,
        remainingQuantity: 25,
        unit: 'servings',
        foodImage: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '452 Pine Street, Downtown, San Francisco, CA 94104',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94104',
        pickupInstructions: 'Kitchen back door access via alleyway. Ring buzzer labeled "Kitchen Service".',
        pickupDate: futureDate(4),
        expiryDate: futureDate(24),
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        isGlutenFree: false,
        containsAllergens: false,
        storageRequirements: 'refrigerated',
        status: 'partially_claimed',
      },
    });

    const donation2 = await prisma.donation.create({
      data: {
        donorId: donor1.id,
        foodName: 'Artisan Sourdough Loaves & Croissants',
        description: 'Assorted freshly baked artisanal sourdough country loaves, chocolate croissants, and almond pastries from our morning bake.',
        category: 'bakery',
        quantity: 30,
        remainingQuantity: 30,
        unit: 'items',
        foodImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '452 Pine Street, Downtown, San Francisco, CA 94104',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94104',
        pickupInstructions: 'Front bakery counter. Ask for Elena.',
        pickupDate: futureDate(3),
        expiryDate: futureDate(48),
        isVegetarian: true,
        isVegan: false,
        isHalal: true,
        isGlutenFree: false,
        containsAllergens: true,
        allergens: 'Wheat,Dairy,Tree nuts',
        storageRequirements: 'room_temperature',
        status: 'available',
      },
    });

    const donation3 = await prisma.donation.create({
      data: {
        donorId: donor2.id,
        foodName: 'Organic Crisp Apples & Citrus Crates',
        description: 'Boxes of high-quality organic Honeycrisp apples, navel oranges, and grapefruits. Surplus from morning distributor shipment in prime condition.',
        category: 'produce',
        quantity: 60,
        remainingQuantity: 60,
        unit: 'kg',
        foodImage: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '880 Market Blvd, San Francisco, CA 94102',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94102',
        pickupInstructions: 'Loading Dock 2 at rear. Ask for Marcus at warehouse receiving desk.',
        pickupDate: futureDate(5),
        expiryDate: futureDate(72),
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        isGlutenFree: true,
        containsAllergens: false,
        storageRequirements: 'room_temperature',
        status: 'available',
      },
    });

    const donation4 = await prisma.donation.create({
      data: {
        donorId: donor2.id,
        foodName: 'Organic Whole Milk & Greek Yogurt Cartons',
        description: 'Sealed pasteurized Grade-A whole milk gallons and individual strawberry Greek yogurt cups. Guaranteed chilled and unopened.',
        category: 'dairy',
        quantity: 40,
        remainingQuantity: 40,
        unit: 'packets',
        foodImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '880 Market Blvd, San Francisco, CA 94102',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94102',
        pickupInstructions: 'Cold storage receiving dock.',
        pickupDate: futureDate(6),
        expiryDate: futureDate(36),
        isVegetarian: true,
        isVegan: false,
        isHalal: true,
        isGlutenFree: true,
        containsAllergens: true,
        allergens: 'Milk / Dairy',
        storageRequirements: 'refrigerated',
        status: 'available',
      },
    });

    const donation5 = await prisma.donation.create({
      data: {
        donorId: donor1.id,
        foodName: 'Hearty Lentil & Vegetable Soup with Baguettes',
        description: 'Nutritious slow-simmered green lentil soup packed with carrots, celery, and tomatoes. Paired with crispy sliced French baguettes.',
        category: 'cooked_meals',
        quantity: 50,
        remainingQuantity: 50,
        unit: 'servings',
        foodImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '452 Pine Street, Downtown, San Francisco, CA 94104',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94104',
        pickupInstructions: 'Packaged in insulated thermal Cambro containers.',
        pickupDate: futureDate(2),
        expiryDate: futureDate(18),
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        isGlutenFree: false,
        containsAllergens: false,
        storageRequirements: 'hot_holding',
        status: 'available',
      },
    });

    const donation6 = await prisma.donation.create({
      data: {
        donorId: donor2.id,
        foodName: 'Canned Soups, Beans & Wholegrain Oatmeal Cartons',
        description: 'Non-perishable assorted canned black beans, garbanzos, tomato soups, and 1kg bags of rolled oats. Long shelf life, ideal for pantry parcels.',
        category: 'canned_packaged',
        quantity: 80,
        remainingQuantity: 80,
        unit: 'boxes',
        foodImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        pickupAddress: '880 Market Blvd, San Francisco, CA 94102',
        pickupCity: 'San Francisco',
        pickupState: 'CA',
        pickupZipCode: '94102',
        pickupInstructions: 'Warehouse aisle 4 pickup.',
        pickupDate: futureDate(12),
        expiryDate: futureDate(360),
        isVegetarian: true,
        isVegan: true,
        isHalal: true,
        isGlutenFree: false,
        containsAllergens: false,
        storageRequirements: 'room_temperature',
        status: 'available',
      },
    });

    console.log('Seeding requests and volunteer tasks in PostgreSQL...');
    // Create an approved request on the first donation
    const request1 = await prisma.request.create({
      data: {
        donationId: donation1.id,
        receiverId: receiver1.id,
        requestedQuantity: 20,
        unit: 'servings',
        message: 'Urgent need for tonight dinner service at our 120 Mission Street shelter. Expecting ~40 guests.',
        deliveryMethod: 'volunteer_delivery',
        deliveryAddress: '120 Mission Street, San Francisco, CA 94105',
        contactPhone: '+1 (555) 678-1234',
        status: 'approved',
      },
    });

    // Create a pending request
    const request2 = await prisma.request.create({
      data: {
        donationId: donation2.id,
        receiverId: receiver2.id,
        requestedQuantity: 15,
        unit: 'items',
        message: 'For our morning family breakfast club at Sunrise Family Center.',
        deliveryMethod: 'volunteer_delivery',
        deliveryAddress: '340 6th Street, San Francisco, CA 94103',
        contactPhone: '+1 (555) 789-2345',
        status: 'pending',
      },
    });

    // Create an open volunteer delivery task from request1
    const task1 = await prisma.volunteerTask.create({
      data: {
        requestId: request1.id,
        donationId: donation1.id,
        volunteerId: null, // open task available for volunteers
        pickupAddress: donation1.pickupAddress,
        pickupContactPerson: donor1.name,
        pickupContactPhone: donor1.phone,
        pickupInstructions: donation1.pickupInstructions,
        deliveryAddress: request1.deliveryAddress,
        deliveryRecipientName: receiver1.organizationName,
        deliveryRecipientPhone: request1.contactPhone,
        deliveryInstructions: request1.message,
        status: 'available',
      },
    });

    console.log('\n======================================================');
    console.log('✅ POSTGRESQL SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Logins for all 4 roles:');
    console.log('1. Donor:     donor@foodbridge.org        / Password123!');
    console.log('2. Receiver:  receiver@foodbridge.org     / Password123!');
    console.log('3. Volunteer: volunteer@foodbridge.org    / Password123!');
    console.log('4. Admin:     admin@foodbridge.org        / Password123!');
    console.log('======================================================\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedData();
