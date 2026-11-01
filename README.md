# 🏡 StayLust — Full-Stack Travel & Vacation Rental Platform

---

<p align="center">

### 🌍 Discover • Book • Review • Explore

A modern full-stack travel and staycation accommodation web application inspired by Airbnb, engineered with **React 19, Vite, Tailwind CSS 4, Motion, Node.js, Express.js 5, MongoDB, Mongoose, Passport.js, Cloudinary, and Mapbox GL JS**.

</p>

<p align="center">

<!-- Core Stack -->
<img src="https://img.shields.io/badge/Node.js-24%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
<img src="https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
<img src="https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose">

<br>

<!-- Frontend -->
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
<img src="https://img.shields.io/badge/Motion-Animation-FFF312?style=for-the-badge" alt="Motion">
<img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">

<br>

<!-- Authentication / Sessions -->
<img src="https://img.shields.io/badge/Passport.js-Authentication-34E27A?style=for-the-badge&logo=passport&logoColor=black" alt="Passport.js">
<img src="https://img.shields.io/badge/Express%20Session-Sessions-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express Session">
<img src="https://img.shields.io/badge/Connect--Mongo-Session%20Store-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="Connect Mongo">

<br>

<!-- Cloud / Maps / APIs -->
<img src="https://img.shields.io/badge/Cloudinary-Image%20Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary">
<img src="https://img.shields.io/badge/Multer-Uploads-4A4A4A?style=for-the-badge" alt="Multer">
<img src="https://img.shields.io/badge/Mapbox-GL%20JS-000000?style=for-the-badge&logo=mapbox&logoColor=white" alt="Mapbox">
<img src="https://img.shields.io/badge/Joi-Validation-00A98F?style=for-the-badge" alt="Joi">
<img src="https://img.shields.io/badge/Render-Deployment-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render">

</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/Architecture-REST%20%2B%20SPA-orange?style=flat-square" alt="Architecture">
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square" alt="React 19">
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?style=flat-square" alt="Tailwind 4">
</p>

---

## 🌐 Live Application

- **Live URL:** [https://wonderlust-yppn.onrender.com](https://wonderlust-yppn.onrender.com)
- **GitHub Repository:** [https://github.com/ranjit-sharma/StayLust](https://github.com/ranjit-sharma/StayLust)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [User Roles & Permissions](#-user-roles--permissions)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [REST API Endpoints](#-rest-api-endpoints)
- [Database Schema Design](#-database-schema-design)
- [Authentication & Security](#-authentication--security)
- [Environment Variables](#-environment-variables)
- [Installation & Local Setup](#-installation--local-setup)
- [Deployment](#-deployment)
- [Author](#-author)

---

# 🌍 About the Project

**StayLust** is an end-to-end travel and vacation rental booking platform modeled after Airbnb. It empowers travellers to explore stays across the world, search properties with live filters, book reservations, leave reviews, and pin favourite destinations. Property hosts can list their accommodations, upload images to cloud storage, and manage bookings and listing details in real time.

The application is structured as a decoupled **Single Page Application (SPA)** powered by **React 19** and **Tailwind CSS 4** communicating with an **Express 5.x REST API** and **MongoDB Atlas** backend, with third-party cloud integrations for **Cloudinary** media storage and **Mapbox GL JS** geocoding and mapping.

---

# ✨ Key Features

### 🔎 Live Search & Dynamic Filtering
- **Debounced Navbar Search**: Instant suggestions popup for titles and locations as you type (>=2 characters, 300ms debounce), with a clear `X` button.
- **Location Auto-Suggestions**: Intelligent typeahead suggestions in the filter drawer matching existing listing cities and destinations.
- **Searchable Category Selector**: Interactive dropdown combobox featuring travel categories (Rooms, Iconic Cities, Mountains, Castles, Amazing Pools, Camping, Farms, Arctic, Beach, Deserts, etc.) with search and icons.
- **Price Range & Rating Sliders**: Fine-tune budget with min/max price sliders and star rating thresholds.
- **Taxes Breakdown Toggle**: Switch between base night prices and full total price including 18% GST.

### 🏠 Listing Management (Full CRUD)
- Create property listings with title, description, category, price, manual country input, and location.
- Automatic **Mapbox Geocoding** transforms addresses into exact GeoJSON `[longitude, latitude]` coordinates.
- **Cloudinary image uploads** via Multer with responsive display and blur-load transitions.
- Edit and update listings with ownership authorization guards (`isOwner`).
- Delete listings with cascading deletion of associated reviews.

### 📅 Booking & Reservation System
- Select check-in and check-out dates with interactive calendar inputs.
- Specify guest counts and view live dynamic pricing calculations (price per night × nights + taxes and service charges).
- Real-time booking submission with automatic reservation status tracking (`confirmed`, `cancelled`).
- Full booking management in user profile with cancel booking options.

### ⭐ Reviews & Star Ratings
- 1 to 5-star ratings with detailed feedback comments.
- Dynamically calculated listing ratings and review counters.
- Truncated review display (shows top 4 reviews with inline `<ins>Show more</ins>` and `<ins>Show less</ins>` toggle).
- Authorization verification ensures only the review author can delete their review (`isReviewAuthor`).

### ❤️ Wishlist & Saved Properties
- Instant heart toggle on listing cards with optimistic UI updates.
- Synchronized to the user's MongoDB profile to browse saved stays anytime.

### 👤 User Account Dashboard
- Dedicated Account modal featuring:
  - **Profile Information**: View username, email, member since date, and host status.
  - **My Bookings**: View active and past stays, dates, total cost, and booking statuses.
  - **My Listings**: Quick management access for all properties hosted by the user.
  - **Wishlist**: Direct access to all saved properties.

### ✉️ Feedback & Support
- FormSubmit-backed feedback form delivering user insights straight to `ctrl.ranjit@gmail.com`.
- Neighbourhood concern and customer support report endpoints.

### 🌙 Modern UI & Dark Mode
- Full Dark / Light theme toggle with local storage persistence and system preference detection.
- Custom branded animated **Compass loading spinner**.
- Animated page transitions powered by **Motion (Framer Motion)**.
- Toast notifications for every action, success, warning, or error.

---

# 👥 User Roles & Permissions

| Capability | Guests | Authenticated Users | Listing Owners |
| :--- | :---: | :---: | :---: |
| Browse & search listings | ✅ | ✅ | ✅ |
| Filter by category, price, location | ✅ | ✅ | ✅ |
| View listing details & Mapbox maps | ✅ | ✅ | ✅ |
| Toggle Dark / Light mode | ✅ | ✅ | ✅ |
| Send feedback | ✅ | ✅ | ✅ |
| Save listings to Wishlist | ❌ | ✅ | ✅ |
| Book a stay / reservation | ❌ | ✅ | ✅ |
| Manage personal bookings | ❌ | ✅ | ✅ |
| Post a review & rating | ❌ | ✅ | ✅ |
| Delete personal review | ❌ | ✅ (own only) | ✅ (own only) |
| Create a new listing | ❌ | ✅ | ✅ |
| Edit / Delete property listing | ❌ | ❌ | ✅ (own listings only) |

---

# 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 (Hooks, Context, Portals)
- **Routing**: React Router 8 (SPA routing)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4, CSS variables
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Maps**: Mapbox GL JS (`mapbox-gl`)

### Backend (Server)
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js 5
- **Database**: MongoDB Atlas with Mongoose 9 ODM
- **Authentication**: Passport.js & Passport-Local
- **Session Management**: Express-Session & Connect-Mongo
- **Validation**: Joi (Object schema validation)
- **File Uploads**: Multer & Multer-Storage-Cloudinary
- **External Services**: Cloudinary API, Mapbox SDK (`@mapbox/mapbox-sdk`), FormSubmit

---

# 🏗️ System Architecture

```text
                           ┌──────────────────────────┐
                           │      React 19 SPA        │
                           │   (Vite + Tailwind 4)    │
                           └─────────────┬────────────┘
                                         │ JSON API Calls (/api)
                                         ▼
                           ┌──────────────────────────┐
                           │      Express 5 Server    │
                           └─────────────┬────────────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
          Middleware Pipeline     REST Controllers      Session Management
        (Auth, Joi, Multer)     (Listings, Bookings)      (Connect-Mongo)
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │  Mongoose Models  │
                               └─────────┬─────────┘
                                         │
                                         ▼
                               ┌───────────────────┐
                               │   MongoDB Atlas   │
                               └───────────────────┘

         External APIs:
         ├── Cloudinary     ──> Cloud image hosting & media transformations
         ├── Mapbox GL JS   ──> Geocoding & interactive web maps
         └── FormSubmit     ──> Direct email notification delivery
```

---

# 📁 Project Directory Structure

```text
MajorProject/
├── client/                        # React frontend SPA
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── BookingCard.jsx    # Reservation date/guest pricing widget
│   │   │   ├── FilterPanel.jsx    # Search filters & category select
│   │   │   ├── Footer.jsx         # Site footer & social links
│   │   │   ├── ListingCard.jsx    # Property summary card with wishlist
│   │   │   ├── ListingHero.jsx    # Property gallery & header
│   │   │   ├── ListingMap.jsx     # Mapbox GL JS integration
│   │   │   ├── Navbar.jsx         # Header with live search & profile menu
│   │   │   ├── SearchableSelect.jsx # Custom category select with search
│   │   │   ├── WishlistButton.jsx # Save to wishlist toggle button
│   │   │   └── ui.jsx             # Compass brand spinner, modal dialogs
│   │   ├── lib/                   # Utilities, auth context, toast, theme
│   │   ├── pages/                 # Route views (Listings, Detail, Form, Auth)
│   │   ├── App.jsx                # Main application layout and routes
│   │   └── main.jsx               # React entry point
│   ├── package.json               # Client dependencies
│   └── vite.config.js             # Vite build configuration & API proxy
├── controller/                    # Express business logic controllers
│   ├── bookings.js                # Booking creation, retrieval, cancellation
│   ├── listings.js                # Listing CRUD, search, wishlist toggle
│   ├── reviews.js                 # Review creation and author deletion
│   └── users.js                   # Sign-up, login, logout, current user
├── models/                        # Mongoose data models
│   ├── booking.js                 # Booking schema & status
│   ├── listing.js                 # Listing schema with GeoJSON & reviews
│   ├── review.js                  # Review schema with author ref
│   ├── supportSubmission.js       # Feedback & support messages
│   └── user.js                    # Passport-local-mongoose user schema
├── routes/                        # Express API route declarations
│   ├── booking.js                 # /api/bookings and /api/listings/:id/bookings
│   ├── info.js                    # /api/info (meta, feedback, support)
│   ├── listing.js                 # /api/listings (CRUD & wishlist)
│   ├── review.js                  # /api/listings/:id/reviews
│   └── user.js                    # /api/users (auth routes)
├── utils/                         # Helper utilities, error classes, categories
├── init/                          # Database seed scripts & sample listings
├── middleware.js                  # Auth, ownership, and Joi validation guards
├── cloudConfig.js                 # Cloudinary & Multer configuration
├── schema.js                      # Joi request body validation schemas
├── app.js                         # Express application entry point
├── package.json                   # Backend dependencies & build scripts
└── README.md                      # Project documentation
```

---

# 🔌 REST API Endpoints

### 🔐 Authentication (`/api/users`)
- `POST /api/users/signup` — Register new user account
- `POST /api/users/login` — Authenticate and start session
- `POST /api/users/logout` — Terminate user session
- `GET /api/users/current` — Get currently logged-in user profile

### 🏡 Listings (`/api/listings`)
- `GET /api/listings` — List all properties (supports `q`, `category`, `location`, `country`, `minPrice`, `maxPrice`, `minRating`)
- `POST /api/listings` — Create new listing (Protected, multipart image upload)
- `GET /api/listings/:id` — Retrieve single listing with populated owner, reviews, and coordinates
- `PUT /api/listings/:id` — Update listing (Owner only, multipart image upload)
- `DELETE /api/listings/:id` — Delete listing and clean associated reviews (Owner only)
- `POST /api/listings/:id/wishlist` — Toggle listing in user's saved wishlist (Protected)

### 📅 Bookings (`/api/listings/:id/bookings` & `/api/bookings`)
- `POST /api/listings/:id/bookings` — Book listing with check-in, check-out, and guest details
- `GET /api/bookings/my` — Get all bookings for current user
- `POST /api/bookings/:bookingId/cancel` — Cancel an existing booking
- `DELETE /api/bookings/:bookingId` — Delete booking record

### ⭐ Reviews (`/api/listings/:id/reviews`)
- `POST /api/listings/:id/reviews` — Post review and rating for a listing (Protected)
- `DELETE /api/listings/:id/reviews/:reviewId` — Delete a review (Author only)

### ℹ️ Metadata & Support (`/api/info`)
- `GET /api/info/meta` — Get categories list, location suggestions, and public Mapbox token
- `POST /api/info/feedback` — Submit general user feedback
- `POST /api/info/support/neighbourhood-concern` — Submit neighbourhood reports

---

# 🗄️ Database Schema Design

```text
User
├── username: String (unique)
├── email: String (unique)
├── wishlist: [ObjectId -> Listing]
└── timestamps

Listing
├── title: String
├── description: String
├── image: { url: String, filename: String }
├── price: Number
├── location: String
├── country: String
├── category: String
├── geometry: { type: "Point", coordinates: [Number, Number] }
├── owner: ObjectId -> User
├── reviews: [ObjectId -> Review]
└── timestamps

Review
├── rating: Number (1-5)
├── comment: String
├── author: ObjectId -> User
└── createdAt: Date

Booking
├── listing: ObjectId -> Listing
├── user: ObjectId -> User
├── checkIn: Date
├── checkOut: Date
├── guests: Number
├── totalPrice: Number
├── status: String ("confirmed" | "cancelled")
└── timestamps
```

---

# 🔒 Authentication & Security

- **Passport-Local Strategy**: Salted and hashed password hashing managed via `passport-local-mongoose`.
- **Session Protection**: HttpOnly cookie sessions stored securely in MongoDB Atlas using `connect-mongo`.
- **Authorization Guards**:
  - `isLoggedIn`: Verifies session before allowing listing creation, booking, review submission, or wishlist edits.
  - `isOwner`: Verifies that `req.user._id` matches `listing.owner` before update or delete mutations.
  - `isReviewAuthor`: Verifies that `req.user._id` matches `review.author` before deletion.
- **Payload Validation**: Strict Joi schemas validate all listing and review inputs before execution.
- **Environment Isolation**: Private API keys, MongoDB URIs, and session secrets are managed via `.env` and kept out of version control.

---

# ⚙️ Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# MongoDB Atlas Connection
ATLASDB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/staylust?retryWrites=true&w=majority

# Express Session Secret
SESSION_SECRET=your_super_secret_session_key

# Cloudinary Storage
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Mapbox
MAP_TOKEN=your_mapbox_public_token

# Environment
NODE_ENV=development
PORT=8080
```

---

# 💻 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance
- [Cloudinary](https://cloudinary.com/) account (for image hosting)
- [Mapbox](https://www.mapbox.com/) account (for maps & geocoding token)

### 1. Clone the Repository
```bash
git clone https://github.com/ranjit-sharma/StayLust.git
cd StayLust
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix client
```

### 3. Seed Sample Listings (Optional)
To initialize the database with sample properties:
```bash
node init/index.js
```

### 4. Run Development Servers
Start the Express backend and Vite frontend concurrently:

**Terminal 1 (Backend API):**
```bash
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev --prefix client
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite proxies `/api` calls directly to the Express server running on port `8080`.

### 5. Production Build & Run
To test the production build locally where Express serves the static React application:
```bash
npm run build
npm start
```
Access the application at [http://localhost:8080](http://localhost:8080).

---

# 🚀 Deployment

The project is configured for one-click deployment on platforms like **Render**:

1. **Connect GitHub Repo**: Link `https://github.com/ranjit-sharma/StayLust` to a new Render Web Service.
2. **Build Command**:
   ```bash
   npm run build
   ```
   *(Installs client dependencies and compiles Vite into `client/dist`)*
3. **Start Command**:
   ```bash
   npm start
   ```
   *(Starts `node app.js`, which serves the REST API and the React production build)*
4. **Environment Variables**: Add `ATLASDB_URL`, `SESSION_SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`, `MAP_TOKEN`, and `NODE_ENV=production` in the service settings.

---

# 👨‍💻 Author

### Ranjit Sharma
- **GitHub:** [@ranjit-sharma](https://github.com/ranjit-sharma)
- **Repository:** [StayLust](https://github.com/ranjit-sharma/StayLust)

---

<p align="center">
  Built with ❤️ using React 19, Tailwind CSS 4, Node.js, Express, MongoDB, Cloudinary, and Mapbox.
</p>
