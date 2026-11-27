-- CreateEnum
CREATE TYPE "Role" AS ENUM ('donor', 'receiver', 'volunteer', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'pending');

-- CreateEnum
CREATE TYPE "DonationCategory" AS ENUM ('cooked_meals', 'raw_ingredients', 'bakery', 'produce', 'dairy', 'canned_packaged', 'beverages', 'other');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('available', 'partially_claimed', 'reserved', 'completed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('volunteer_delivery', 'receiver_pickup');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('available', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'donor',
    "organizationName" TEXT DEFAULT '',
    "organizationType" TEXT DEFAULT 'Individual',
    "profileImage" TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    "bio" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "street" TEXT DEFAULT '',
    "city" TEXT DEFAULT '',
    "state" TEXT DEFAULT '',
    "zipCode" TEXT DEFAULT '',
    "formattedAddress" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "DonationCategory" NOT NULL DEFAULT 'cooked_meals',
    "quantity" INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'servings',
    "foodImage" TEXT DEFAULT 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    "pickupStreet" TEXT DEFAULT '',
    "pickupCity" TEXT DEFAULT '',
    "pickupState" TEXT DEFAULT '',
    "pickupZipCode" TEXT DEFAULT '',
    "pickupAddress" TEXT NOT NULL,
    "pickupInstructions" TEXT DEFAULT '',
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isHalal" BOOLEAN NOT NULL DEFAULT false,
    "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
    "containsAllergens" BOOLEAN NOT NULL DEFAULT false,
    "allergens" TEXT DEFAULT '',
    "storageRequirements" TEXT NOT NULL DEFAULT 'room_temperature',
    "status" "DonationStatus" NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'servings',
    "message" TEXT NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'volunteer_delivery',
    "deliveryAddress" TEXT DEFAULT '',
    "contactPhone" TEXT DEFAULT '',
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_tasks" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "volunteerId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupContactPerson" TEXT DEFAULT '',
    "pickupContactPhone" TEXT DEFAULT '',
    "pickupInstructions" TEXT DEFAULT '',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryRecipientName" TEXT DEFAULT '',
    "deliveryRecipientPhone" TEXT DEFAULT '',
    "deliveryInstructions" TEXT DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'available',
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT DEFAULT '',
    "confirmationCode" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "donations_donorId_idx" ON "donations"("donorId");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_category_idx" ON "donations"("category");

-- CreateIndex
CREATE INDEX "donations_expiryDate_idx" ON "donations"("expiryDate");

-- CreateIndex
CREATE INDEX "requests_donationId_idx" ON "requests"("donationId");

-- CreateIndex
CREATE INDEX "requests_receiverId_idx" ON "requests"("receiverId");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_tasks_requestId_key" ON "volunteer_tasks"("requestId");

-- CreateIndex
CREATE INDEX "volunteer_tasks_volunteerId_idx" ON "volunteer_tasks"("volunteerId");

-- CreateIndex
CREATE INDEX "volunteer_tasks_donationId_idx" ON "volunteer_tasks"("donationId");

-- CreateIndex
CREATE INDEX "volunteer_tasks_status_idx" ON "volunteer_tasks"("status");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_tasks" ADD CONSTRAINT "volunteer_tasks_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_tasks" ADD CONSTRAINT "volunteer_tasks_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_tasks" ADD CONSTRAINT "volunteer_tasks_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
