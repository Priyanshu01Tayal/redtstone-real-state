# REDSTONE REAL ESTATE BROKERAGE PLATFORM

> **Premium Managed Real Estate Brokerage Web Application**
> Built with Node.js, Express, MongoDB Atlas / Mongoose, Socket.IO, React (Vite), and Tailwind CSS.
> Visual Identity: **Premium Red and White** (`#C62828`, `#E53935`, `#FFFFFF`, `#F8F8F8`, `#222222`).

---

## 1. PROJECT OVERVIEW & CORE ARCHITECTURE

**RedStone Brokerage** is an institutional managed real estate marketplace connecting three primary stakeholders under strict brokerage governance:

1. **Property Owner**: Registers and uploads residential, commercial, or plotted properties with custom pricing and requirements.
2. **In-House Broker**: Salaried, certified real estate consultants who physically inspect properties, manage leads, conduct site tours, and negotiate deals.
3. **Property Client (Buyer / Tenant)**: Explores verified property listings, submits inquiries, and schedules accompanied site tours.
4. **Platform Administrator**: Reviews owner property submissions, verifies legal titles, assigns designated in-house brokers, tracks transactions, and manages brokerage commissions.

### 🛡️ Critical Privacy Rule (Owner Protection Shield)
Unlike ordinary classified portals that sell owner phone numbers to hundreds of telemarketers:
- **Clients NEVER see property owner personal contact info** (phone, email, private address, or identity).
- Clients communicate **exclusively with the assigned in-house broker**.
- Every property public page displays the **assigned broker's certified profile, photo, phone, and rating**.

---

## 2. DESIGN SYSTEM & COLOR THEME

RedStone implements a tailored **Red and White** visual identity:

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Red** | `#C62828` | Primary brand color, headers, key CTA buttons, active states |
| **Secondary Red** | `#E53935` | Accents, badges, interactive highlights, hover states |
| **Pure White** | `#FFFFFF` | Clean background for property cards and modal containers |
| **Soft Neutral** | `#F8F8F8` | Platform background for reduced eye strain |
| **Dark Charcoal** | `#222222` | High-contrast readable typography |
| **Subtle Grey** | `#777777` | Descriptive metadata and specification labels |
| **Border Grey** | `#EEEEEE` | Thin crisp card and table separators |
| **Success Emerald** | `#2E7D32` | Confirmed visits, approved listings, paid commissions |

---

## 3. USER ROLES & PERMISSIONS

1. **Property Owner (`role: 'owner'`)**
   - Submit new properties (starts in `pending` approval).
   - View approved, pending, and rejected property listings with feedback reasons.
   - Receive automatic instant alerts when an enquiry arrives or a visit is scheduled.
   - Confirm or request reschedules for property visits.
   - Track views, inquiries count, and live deal status.

2. **In-House Broker (`role: 'broker'`)**
   - Access designated property portfolio assigned by Admin.
   - View full property information **including verified owner contact details**.
   - Manage incoming client inquiries and update pipeline (`new` → `contacted` → `visit_requested` → `negotiation` → `closed_won`).
   - Schedule, reschedule, or cancel accompanied site tours.
   - Execute visits and record inspection feedback notes.
   - Record closed transactions and track personal broker commission share.

3. **Client / Buyer / Tenant (`role: 'client'`)**
   - Search properties with multi-criteria server-side filters (Price, Area, Bedrooms, Furnishing, Type).
   - View high-res galleries, walkthrough videos, specifications, and assigned broker details.
   - Submit direct property inquiries with preferred callback slots and budget.
   - Request and schedule physical site visits.
   - View scheduled visit itineraries with broker escort contact details.

4. **Administrator (`role: 'admin'`)**
   - High-level KPIs: Total users, active properties, inquiries, visits, closed deal volume, and brokerage revenue.
   - Property Approval Hub: Approve submitted properties and assign an in-house broker (publishing listing to the marketplace), or reject with actionable feedback.
   - Reassign brokers to properties as workloads change.
   - Commission Management Module: Track property transaction value, commission percentage/fixed fee, payer splits, and broker share (40%) vs company revenue (60%).
   - User Directory: Activate or suspend user accounts.
   - Audit Trail: Immutable security logging of all actions and IP addresses.

---

## 4. END-TO-END BUSINESS WORKFLOW

```
OWNER REGISTERS
     ↓
OWNER ADDS PROPERTY (Starts as 'pending')
     ↓
PROPERTY GOES FOR ADMIN APPROVAL
     ↓
ADMIN APPROVES PROPERTY & ASSIGNS IN-HOUSE BROKER
     ↓
PROPERTY BECOMES PUBLIC (Owner details redacted, Broker exposed)
     ↓
CLIENT VIEWS PROPERTY & SUBMITS ENQUIRY
     ↓
OWNER & BROKER RECEIVE AUTOMATIC NOTIFICATION
     ↓
BROKER CONTACTS CLIENT & SCHEDULES PROPERTY VISIT
     ↓
OWNER CONFIRMS VISIT AVAILABILITY (Or requests alternative time)
     ↓
BROKER CONDUCTS SITE VISIT & RECORDS CLIENT FEEDBACK
     ↓
PRICE NEGOTIATION WITH OWNER & BUYER
     ↓
DEAL CLOSED (Marked as 'closed', Property marked 'sold' or 'rented')
     ↓
COMMISSION GENERATED (Broker share vs Company revenue tracked)
     ↓
ADMIN DISBURSES BROKER COMMISSION & RECORDS PAYMENT REFERENCE
```

---

## 5. DATABASE DESIGN (MongoDB & Mongoose)

The platform models 10 properly normalized, indexed collections in `backend/models/`:

1. **`Users`**: Authentication, roles, broker license credentials, ratings, and avatars.
2. **`Properties`**: Title, category, specifications, amenities, geo-coordinates, images, videos, `ownerId`, `assignedBrokerId`, `approvalStatus` (`pending`, `approved`, `rejected`), `listingStatus` (`active`, `sold`, `rented`).
3. **`PropertyMedia`**: Media tracking for images, videos, and architectural floor plans.
4. **`BrokerAssignments`**: Audit log of broker allocations and reassignments.
5. **`Enquiries`**: Client inquiries connecting property, client, broker, and owner.
6. **`Visits`**: Full visit lifecycle (`Requested`, `Proposed`, `Scheduled`, `Confirmed`, `Completed`, `Cancelled`, `Rescheduled`, `No Show`), with owner confirmation states.
7. **`FollowUps`**: Broker CRM reminders (Calls, WhatsApp, Meetings, Site Visits).
8. **`Deals`**: Contract closure details, final transaction price, and agreement milestones.
9. **`Commissions`**: Financial ledger tracking deal value, brokerage %, payer split, broker commission amount, company net income, and payment status (`pending`, `paid`).
10. **`AuditLogs`**: Security audit log tracking user ID, IP address, action, and resource.

---

## 6. READY-TO-TEST DEMO ACCOUNTS

The platform includes a pre-seeded database with realistic listings, leads, visits, and deals. You can log in instantly using the **1-Click Demo Bar** on the navigation bar or login screen:

| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **👑 Admin Master** | `admin@redstone.com` | `password123` | Full control: Approvals, Commissions, Users, Settings |
| **👔 In-House Broker** | `vikram.broker@redstone.com` | `password123` | Senior Luxury Broker: Active leads, today's visits, closed deals |
| **🏠 Property Owner** | `amit.owner@example.com` | `password123` | Owner of multiple properties in Gurgaon and Delhi NCR |
| **🎯 Client / Buyer** | `priya.client@example.com` | `password123` | Buyer: Submitted enquiries and scheduled site tours |

---

## 7. INSTALLATION & RUNNING LOCALLY

### Prerequisites
- Node.js v18+ or v22+
- npm v9+
- MongoDB (Local daemon or MongoDB Atlas URI)

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Seed initial test data (Users, Properties, Enquiries, Visits, Deals)
node seed/seedData.js

# Start backend server
npm start
# Server starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Application accessible at http://localhost:5173 (or http://localhost:5174)
```

### Running the End-to-End Automated Workflow Test
You can run the automated script that executes all 15 business steps:
```bash
cd backend
node test-workflow.js
```

---

## 8. ENVIRONMENT CONFIGURATION (`.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/redstone_realestate
JWT_SECRET=redstone_brokerage_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:5173
```

---

## 9. API ROUTES SUMMARY

### Authentication (`/api/auth`)
- `POST /register`: Register user (owner, client, broker applicant).
- `POST /login`: Authenticate and receive JWT.
- `GET /me`: Get authenticated user profile.
- `PUT /profile`: Update profile info.
- `GET /demo-accounts`: Returns pre-set demo credentials.

### Properties (`/api/properties`)
- `GET /`: Public search and filter (approved listings only, owner redacted).
- `GET /:id`: Single property details (owner redacted for clients).
- `GET /featured`: Top featured listings.
- `POST /owner`: Owner submits new property (`pending` status).
- `GET /owner/my-properties`: Owner gets their portfolio.
- `PUT /owner/:id`: Owner edits property.
- `DELETE /owner/:id`: Owner removes property.
- `POST /upload`: Multi-file upload for photos and documents.

### Enquiries (`/api/enquiries`)
- `POST /`: Client submits enquiry (notifies owner and broker).
- `GET /client`: Client views their enquiry history.
- `GET /broker`: Broker views enquiries on assigned properties.
- `PUT /:id/status`: Broker updates lead status and adds notes.
- `GET /admin`: Admin master enquiry stream.

### Visits (`/api/visits`)
- `POST /`: Schedule property visit (triggers owner notification).
- `PUT /:id/owner-confirmation`: Owner confirms or requests reschedule.
- `PUT /:id/status`: Broker updates status (`Confirmed`, `Completed`, `Cancelled`, `Rescheduled`).
- `GET /owner`: Owner views visits for their properties.
- `GET /broker`: Broker views visits across assigned properties.
- `GET /client`: Client views scheduled visits with broker escort info.
- `GET /admin`: Admin views all visits across platform.

### Deals & Commissions (`/api/deals`)
- `POST /`: Broker/Admin closes deal and creates commission record.
- `GET /`: Get deals filtered by stakeholder role.
- `GET /commissions`: Commission ledger (total fee, broker share, company revenue).
- `PUT /commissions/:id/payment`: Admin updates commission payment to Paid.

### Admin Operations (`/api/admin`)
- `GET /dashboard-stats`: High-level business analytics.
- `GET /properties`: Master property list.
- `PUT /properties/:id/approve`: Approve listing & assign in-house broker.
- `PUT /properties/:id/reject`: Reject listing with feedback.
- `GET /users`: User directory with role filter.
- `PUT /users/:id/status`: Toggle user status (`active` / `suspended`).
- `GET /audit-logs`: Audit trail logs.

### Maps & Geospatial (`/api/maps`)
- `GET /properties`: Viewport bounding box search (`$geoWithin` with `$box`) and radius search (`$near`).
- `GET /availability-heatmap`: Layer A real property availability density grouped by spatial clusters and localities.
- `GET /demand-heatmap`: Layer B client demand heatmap from active requirements (strictly anonymized, 0% PII).
- `GET /locality-summary`: Real-time cross-tabulation of supply vs buyer demand ratios by locality (Crossing Republik, Indirapuram, Sector 62, etc.).

### Broker Verification & Inspections (`/api/broker`)
- `GET /verification-queue`: Properties awaiting physical broker verification.
- `POST /inspections`: Broker schedules on-site property inspection.
- `GET /inspections/:id`: Inspection details and checklist.
- `PATCH /inspections/:id`: Update inspection checklist, condition rating (1-5 stars), discrepancies, and inspection photos.
- `POST /properties/:id/verification-recommendation`: Broker submits formal recommendation (`approved`, `rejected`, `more_info_needed`) with rationale to Admin.
- `GET /requirements`: Active buyer/tenant requirements in broker territory.
- `GET /requirements/:id/matches`: Real-time weighted match engine results for requirement.

### Client Requirements & Matches (`/api/client`)
- `POST /requirements`: Client submits tailored property criteria with budget, localities, and specifications.
- `GET /requirements`: Client lists their active requirements.
- `GET /requirements/:id`: Single requirement details.
- `PATCH /requirements/:id`: Update requirement criteria.
- `DELETE /requirements/:id`: Delete or archive requirement.
- `GET /requirements/:id/matches`: Real-time matching engine scoring (Location 30%, Budget 25%, Type 20%, Area 10%, Specs 10%, Availability 5%).
- `POST /favorites/:propertyId`: Toggle property favorite.
- `GET /favorites`: Retrieve client's saved favorite properties.
- `POST /saved-searches`: Save custom search filter criteria.
- `GET /saved-searches`: Retrieve saved searches.

### Notifications (`/api/notifications`)
- `GET /`: Logged-in user's notifications.
- `PUT /:id/read`: Mark single notification as read.
- `PUT /read-all`: Mark all notifications as read.

---

## 9. AUTOMATED VERIFICATION & TEST SUITE

The platform comes with a comprehensive 15-step automated end-to-end verification script:

```bash
# Run the master automated test suite
node backend/test-master-e2e.js
```

### Verified Test Cases (100% Success):
1. **Health & Server Connectivity**: HTTP 200 health probe.
2. **Owner Registration & JWT Authentication**: User creation and secure credential hashing.
3. **9-Step Property Submission with GeoJSON Point**: Stored with 2dsphere indexing and `PENDING_BROKER_VERIFICATION` status.
4. **Privacy Shield Redaction**: 100% assertion that owner contact info is hidden from public and client endpoints.
5. **Geospatial Bounding Box Map Search**: Fast `$geoWithin` box query for viewport map browsing.
6. **Layer A: Property Availability Heatmap Density**: Real spatial cluster density aggregation.
7. **Layer B: Client Demand Heatmap (Zero PII)**: Anonymized buyer interest aggregation.
8. **Locality Supply vs Demand Market Ratios**: Live market gap computation (Crossing Republik, Indirapuram, etc.).
9. **Broker Verification Queue**: Broker inspection workflow access.
10. **Broker Physical Inspection Scheduling & Checklist**: Checklist verification (address, deeds, specs, condition rated).
11. **Broker Recommendation Submission to Admin**: Status updated to `VERIFIED` with audit logs.
12. **Admin Final Publication Approval & Broker Assignment**: Admin approval and publication to public catalog.
13. **Client Requirement Creation & Weighted Match Engine**: Match scoring algorithm up to 96% with explanatory tags.
14. **Client Favorites Toggle & Retrieval**: Instant save and retrieve.
15. **Full Brokerage Deal & Commission Ledger**: Closed deal recorded, 2% commission calculated (₹1.60L), 40% broker share (₹64K) disbursed.
