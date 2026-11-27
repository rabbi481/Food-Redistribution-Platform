# 🥗 FoodBridge — Food Redistribution Platform

> **Share Food, Reduce Waste, Save Lives.**  
> A full-stack web application engineered to eliminate commercial and community food waste by connecting food donors, charitable organizations (NGOs), volunteer delivery couriers, and platform administrators in real-time.  
> Powered by **React (Vite) + Node.js (Express) + PostgreSQL + Prisma ORM + Tailwind CSS**.

---

## 📋 Table of Contents
1. [Platform Overview & Features](#-platform-overview--features)
2. [Technology Stack](#-technology-stack)
3. [User Roles & Workflows](#-user-roles--workflows)
4. [Relational Database Schema Design](#-relational-database-schema-design)
5. [Project Architecture & Folder Structure](#-project-architecture--folder-structure)
6. [Environment Variables & Setup](#-environment-variables--setup)
7. [PostgreSQL Database Setup & Migrations](#-postgresql-database-setup--migrations)
8. [Database Seeding & Demo Accounts](#-database-seeding--demo-accounts)
9. [Running the Application](#-running-the-application)
10. [REST API Endpoints Specification](#-rest-api-endpoints-specification)
11. [PostgreSQL Transactions & Food Safety Rules](#-postgresql-transactions--food-safety-rules)
12. [Security Best Practices](#-security-best-practices)

---

## 🌟 Platform Overview & Features

### Core Capabilities:
- **Relational Food Data Modeling:** High-integrity schema managed with **Prisma ORM** over **PostgreSQL**, leveraging foreign keys, cascading deletions, custom enums, and performance indexes.
- **Real-Time Surplus Food Listing:** Donors (restaurants, supermarkets, bakeries, caterers) can post surplus food listings with photos, category tagging, unit portions, pickup windows, and strict expiry countdowns.
- **Charity / NGO Food Claims:** Receivers browse active food listings, apply search/dietary filters (Vegetarian, Halal, Gluten-Free), and submit portion requests with immediate quantity limit checks.
- **Atomic Concurrency Protection (PostgreSQL Transactions):** Request approvals utilize `prisma.$transaction(...)` to atomically verify remaining quantities, decrement portions, and assign tasks, eliminating race conditions or food over-booking.
- **Volunteer Delivery Logistics:** Registered couriers view open pickup-to-drop-off missions, accept tasks, and update progress step-by-step (*Assigned* ➔ *Picked Up* ➔ *In Transit* ➔ *Delivered*).
- **Admin Governance & Moderation:** Administrators oversee platform metrics, moderate food listings, toggle user account status (Active / Suspended), and monitor food safety compliance.
- **Automated Food Safety Engine:** Background service automatically expires and deactivates listings that have passed their strict expiry threshold, preventing spoiled food distribution.
- **Dynamic Live Statistics:** Real-time database metrics calculating total portions rescued, active listings, partner NGOs, and volunteer couriers via Prisma aggregate queries.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Custom `#16A34A` Emerald & `#15803D` Green palette)
- **Routing:** React Router DOM v6 (Nested layouts, role-based Protected Routes)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Configured with JWT request & response interceptors)
- **Typography:** Plus Jakarta Sans & Inter

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (Modular controllers, routes, and error handling)
- **Database:** PostgreSQL (Primary Relational Database)
- **ORM:** Prisma ORM v5 (`@prisma/client` + `prisma` CLI)
- **Authentication:** JSON Web Tokens (JWT) + HTTP Bearer tokens
- **Security:** bcryptjs password hashing (10 salt rounds), CORS whitelist
- **Logging:** Morgan HTTP logger

---

## 👥 User Roles & Workflows

| Role | Target Users | Key Features |
| :--- | :--- | :--- |
| **Donor** | Restaurants, Hotels, Bakeries, Supermarkets, Caterers | Post surplus meals, manage active listings, inspect incoming NGO requests, approve/reject requests, view history. |
| **Receiver** | NGOs, Homeless Shelters, Food Pantries, Families | Search food catalog, filter by dietary badges, request meal portions, track delivery status in real-time. |
| **Volunteer** | Urban couriers, Cargo cyclists, Community drivers | Browse open delivery missions, accept tasks, follow pickup/drop-off directions, step-by-step delivery updates. |
| **Admin** | FoodBridge Operations HQ | System metrics, user account moderation (Activate/Suspend/Delete), food listing moderation, audit logs. |

---

## 🗄 Relational Database Schema Design (Prisma / PostgreSQL)

### 1. `users` Table (`model User`)
- `id`: `String` (UUID primary key)
- `name`: `String`
- `email`: `String` (Unique, lowercase)
- `password`: `String` (Hashed with bcrypt)
- `phone`: `String`
- `role`: `Role` enum (`donor`, `receiver`, `volunteer`, `admin`)
- `organizationName`: `String`
- `organizationType`: `String` (Restaurant, Supermarket, Bakery, NGO, Shelter, etc.)
- `profileImage`: `String`
- `bio`: `String` (Text)
- `status`: `UserStatus` enum (`active`, `suspended`, `pending`)
- `isVerified`: `Boolean`
- Address: `street`, `city`, `state`, `zipCode`, `formattedAddress`
- Timestamps: `createdAt`, `updatedAt`
- Relations: `donations` (1-to-many), `requests` (1-to-many), `volunteerTasks` (1-to-many)

### 2. `donations` Table (`model Donation`)
- `id`: `String` (UUID primary key)
- `donorId`: `String` (Foreign key to `users.id` with `onDelete: Cascade`)
- `foodName`: `String`
- `description`: `String` (Text)
- `category`: `DonationCategory` enum (`cooked_meals`, `raw_ingredients`, `bakery`, `produce`, `dairy`, `canned_packaged`, `beverages`, `other`)
- `quantity`: `Int`
- `remainingQuantity`: `Int` (Decremented atomically upon approved requests)
- `unit`: `String` (`servings`, `kg`, `boxes`, `packets`, `liters`, `items`)
- `foodImage`: `String`
- Pickup location: `pickupAddress`, `pickupCity`, `pickupState`, `pickupZipCode`, `pickupInstructions`
- Timelines: `pickupDate` (DateTime), `expiryDate` (DateTime)
- Dietary & safety: `isVegetarian`, `isVegan`, `isHalal`, `isGlutenFree`, `containsAllergens`, `allergens`, `storageRequirements`
- `status`: `DonationStatus` enum (`available`, `partially_claimed`, `reserved`, `completed`, `expired`, `cancelled`)
- Indexes: `donorId`, `status`, `category`, `expiryDate`

### 3. `requests` Table (`model Request`)
- `id`: `String` (UUID primary key)
- `donationId`: `String` (Foreign key to `donations.id` with `onDelete: Cascade`)
- `receiverId`: `String` (Foreign key to `users.id` with `onDelete: Cascade`)
- `requestedQuantity`: `Int`
- `unit`: `String`
- `message`: `String` (Text)
- `deliveryMethod`: `DeliveryMethod` enum (`volunteer_delivery`, `receiver_pickup`)
- `deliveryAddress`: `String`
- `contactPhone`: `String`
- `status`: `RequestStatus` enum (`pending`, `approved`, `rejected`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`)
- `rejectionReason`: `String`
- Indexes: `donationId`, `receiverId`, `status`

### 4. `volunteer_tasks` Table (`model VolunteerTask`)
- `id`: `String` (UUID primary key)
- `requestId`: `String` (Unique foreign key to `requests.id` with `onDelete: Cascade`)
- `donationId`: `String` (Foreign key to `donations.id` with `onDelete: Cascade`)
- `volunteerId`: `String?` (Foreign key to `users.id` with `onDelete: SetNull`)
- Pickup details: `pickupAddress`, `pickupContactPerson`, `pickupContactPhone`, `pickupInstructions`
- Delivery details: `deliveryAddress`, `deliveryRecipientName`, `deliveryRecipientPhone`, `deliveryInstructions`
- `status`: `TaskStatus` enum (`available`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`)
- Timestamps: `assignedAt`, `pickedUpAt`, `deliveredAt`
- Indexes: `volunteerId`, `donationId`, `status`

---

## 📁 Project Architecture & Folder Structure

```text
Food_Redistribution/
├── backend/
│   ├── config/
│   │   └── prisma.js             # Singleton PrismaClient instance
│   ├── controllers/
│   │   ├── authController.js      # JWT registration, login, profile management
│   │   ├── dashboardController.js # Real PostgreSQL aggregations & platform statistics
│   │   ├── donationController.js  # CRUD food listings, search, dietary filters
│   │   ├── requestController.js   # Food request workflow & atomic transaction approval
│   │   ├── userController.js      # Admin user management & status toggles
│   │   └── volunteerController.js # Volunteer mission acceptance & status updates
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & req.user injection
│   │   ├── dbCheck.js             # PostgreSQL connection verification middleware
│   │   ├── errorHandler.js        # Centralized REST error formatter (Prisma error codes)
│   │   └── role.js                # Role-based authorization middleware
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20261122000000_init/
│   │   │       └── migration.sql  # Initial PostgreSQL DDL migration
│   │   └── schema.prisma          # Prisma relational schema specification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── userRoutes.js
│   │   └── volunteerRoutes.js
│   ├── utils/
│   │   ├── expiryChecker.js       # Background auto-expire helper for PostgreSQL
│   │   ├── formatters.js          # Backwards-compatible response transformer
│   │   └── seed.js                # PostgreSQL seeder script with demo accounts
│   ├── .env.example               # Backend environment template
│   ├── package.json               # Backend dependencies & Prisma scripts
│   └── server.js                  # Main Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── FoodCard.jsx         # Reusable food card with countdown pill
│   │   │   │   ├── Footer.jsx           # Mission & links footer
│   │   │   │   ├── Navbar.jsx           # Responsive header with role badges
│   │   │   │   └── ProtectedRoute.jsx   # Role-guarded route wrapper
│   │   │   └── modals/
│   │   │       ├── CreateDonationModal.jsx # Donor listing creation modal
│   │   │       └── RequestFoodModal.jsx    # Receiver claim modal with validation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User state, JWT storage, demo login
│   │   │   └── ToastContext.jsx         # Custom alert notification provider
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx      # Responsive sidebar portal layout
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx     # Platform governance portal
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPasswordPage.jsx # Password recovery UI
│   │   │   │   ├── LoginPage.jsx          # Login with 1-click test buttons
│   │   │   │   └── RegisterPage.jsx       # Multi-role registration form
│   │   │   ├── donor/
│   │   │   │   └── DonorDashboard.jsx     # Donor listings & request approval
│   │   │   ├── receiver/
│   │   │   │   └── ReceiverDashboard.jsx  # Food catalog & claim tracking
│   │   │   ├── volunteer/
│   │   │   │   └── VolunteerDashboard.jsx # Delivery missions & status updater
│   │   │   ├── DonationsCatalogPage.jsx   # Public food browsing directory
│   │   │   ├── FoodDetailsPage.jsx        # Detailed food inspection page
│   │   │   ├── HomePage.jsx               # Hero, how it works, stats, stories
│   │   │   └── NotFoundPage.jsx           # 404 handler
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with JWT interceptor
│   │   ├── App.jsx                      # Router hierarchy
│   │   ├── index.css                    # Tailwind imports & custom classes
│   │   └── main.jsx                     # Root React mounting
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js                   # Vite dev proxy to :5000 backend
│
├── .gitignore
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## ⚡ Environment Variables & Setup

In `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/foodbridge"
JWT_SECRET=supersecret_foodbridge_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note:** Replace `USERNAME` and `PASSWORD` with your local PostgreSQL user credentials (e.g. `postgres:postgres` or your custom password).

---

## 🐘 PostgreSQL Database Setup & Migrations

### 1. Create the PostgreSQL Database
Connect to PostgreSQL and create the `foodbridge` database:
```sql
CREATE DATABASE foodbridge;
```
Or via terminal:
```bash
createdb -U postgres foodbridge
```

### 2. Apply Prisma Migrations / Schema Sync
From the `backend/` folder:
```bash
cd backend
npx prisma db push
```
Or to run formal migrations:
```bash
npx prisma migrate dev --name init
```

### 3. Generate Prisma Client (if updating schema)
```bash
npx prisma generate
```

---

## 🌱 Database Seeding & Demo Accounts

Populate the database with realistic demo accounts, food listings, requests, and volunteer tasks:
```bash
cd backend
npm run seed
```

### 🔑 Demo Accounts (also available via 1-Click buttons on Login Page):
| Role | Demo Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@foodbridge.org` | `Password123!` | Fresh Bites Bistro & Bakery |
| **Receiver** | `receiver@foodbridge.org` | `Password123!` | Hope Community Kitchen NGO |
| **Volunteer** | `volunteer@foodbridge.org` | `Password123!` | Urban Food Courier |
| **Admin** | `admin@foodbridge.org` | `Password123!` | FoodBridge Operations HQ |

---

## 🚀 Running the Application

### 1. Start Backend API:
```bash
cd backend
npm start
```
*API runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

### 2. Start Frontend Application:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying.*

---

## 📡 REST API Endpoints Specification

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with designated role |
| `POST` | `/api/auth/login` | Public | Login with email & password, returns JWT |
| `GET` | `/api/auth/me` | Private | Retrieve current authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update name, phone, address, organization |
| `PUT` | `/api/auth/password`| Private | Change password |

### 2. Food Donations (`/api/donations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/donations` | Public | Browse available food listings (search, filter, paginate) |
| `GET` | `/api/donations/my` | Donor/Admin | Retrieve current donor's listings |
| `GET` | `/api/donations/:id` | Public | Get single food donation details |
| `POST` | `/api/donations` | Donor/Admin | Create new surplus food donation |
| `PUT` | `/api/donations/:id` | Owner/Admin | Update food donation listing |
| `DELETE`| `/api/donations/:id` | Owner/Admin | Delete food donation listing |

### 3. Food Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Receiver/Admin | Submit claim request for available food |
| `GET` | `/api/requests` | Private | Retrieve user's requests (filtered by role) |
| `GET` | `/api/requests/:id`| Private | Get single request details |
| `PUT` | `/api/requests/:id`| Private | Update status (Approve, Reject, Cancel) |

### 4. Volunteer Delivery Tasks (`/api/volunteer`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/volunteer/tasks` | Volunteer/Admin | List open delivery missions |
| `GET` | `/api/volunteer/my-tasks`| Volunteer/Admin | List tasks assigned to current volunteer |
| `POST`| `/api/volunteer/tasks/:id/accept` | Volunteer/Admin | Accept delivery task |
| `PUT` | `/api/volunteer/tasks/:id/status` | Volunteer/Admin | Update delivery status (`picked_up`, `in_transit`, `delivered`) |

### 5. Platform Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Public/Private | Real-time counts for users, donations, requests, and role metrics |

### 6. User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | List all registered platform users with search & filters |
| `GET` | `/api/users/:id` | Private | Get user profile |
| `PUT` | `/api/users/:id` | Admin/Self | Update user details or role/status |
| `DELETE`| `/api/users/:id` | Admin | Permanently delete user |

---

## 🛡 PostgreSQL Transactions & Food Safety Rules

1. **PostgreSQL Atomic Transactions:** Food claim approvals are executed inside `prisma.$transaction(async (tx) => { ... })`. The transaction re-reads the donation row, verifies available quantity, deducts portions, updates listing status, and creates the volunteer courier task in one atomic commit.
2. **Strict Future Expiry Validation:** Any donation created must specify an expiry date strictly in the future.
3. **Automated Expiry Sweeper:** Background cron periodically updates listings whose expiry time has passed to `expired`, automatically hiding them from claim catalogs.
4. **Over-Claim Prevention:** Requests specifying a quantity higher than the currently available portions (`remainingQuantity`) are rejected with an explicit error.
5. **Hygienic Storage Tags:** Listings state storage requirements (`refrigerated`, `frozen`, `hot_holding`, `room_temperature`) to guide safe courier transport.

---

### 📄 License
ISC License © FoodBridge Team. Designed and developed to nourish communities and eliminate food waste worldwide.
