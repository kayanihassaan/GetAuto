# GetAuto - Vehicle Rental Marketplace PWA

A fully offline-capable Progressive Web App for listing, browsing, and booking vehicles (cars, bikes, buses) with vendor/customer roles, email-OTP authentication, wishlist, ratings, and a vendor dashboard.

> **Status**: Active development · [Demo](http://localhost:3000)

---

## ✨ Features

### 🔐 Authentication
- Email-based login with 6-digit OTP
- OTP delivered via **email (SMTP)** — free with any Gmail app password
- **Demo mode** — OTP shown on screen, no email config needed
- Role selection on first login: **Vendor** or **Customer**

### 👤 Customer
- Browse all available vehicles with type-based icons & gradients
- Filter by vehicle type: Car, Bike, Bus
- **Wishlist** — heart-toggle on any vehicle, dedicated wishlist page
- **Book** — select rental duration & payment method (Cash, Credit Card, JazzCash, EasyPaisa)
- **Rate & Review** — 1–5 star modal + optional review after a booking
- **My Bookings** — view/cancel bookings, rate unrated vehicles

### 🏪 Vendor
- **Dashboard** — stats cards: total listings, rentals received, revenue, average rating
- **Per-vehicle breakdown** — rental count, total revenue, average star rating
- **List a vehicle** — form with type, name, variant, rent/day, image URL, location, description
- **My Vehicles** — manage all listings, see booking stats per vehicle

### 🎨 PWA
- **Installable** — add to home screen on any device
- **Offline-ready** — service worker precaches all assets (Workbox via `vite-plugin-pwa`)
- **Responsive** — mobile-first Tailwind CSS design
- **Black & Yellow** brand theme with Poppins font

---

## 📸 Screenshots

| Login | Browse | Bookings | Vendor Dashboard |
|-------|--------|----------|-----------------|
| Email OTP login | Filter by type | Cancel & rate | Revenue stats |

*(Screenshots to be added)*

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite 5 |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS 3 |
| **Database** | Dexie.js (IndexedDB) — fully client-side, no backend DB |
| **PWA** | `vite-plugin-pwa` (Workbox service worker + manifest) |
| **Routing** | React Router v6 (auth-gated routes) |
| **Server** | Node.js (vanilla `http` module, no Express) |
| **Email (optional)** | Nodemailer — send OTP via any SMTP (Gmail app password) |
| **SMS (optional)** | Twilio — send OTP via SMS |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & install
```bash
git clone https://github.com/kayanihassaan/GetAuto.git
cd GetAuto
npm install
```

### 2. Run in demo mode (no configuration needed)
```bash
npm run build
node server.mjs
```

Open **http://localhost:3000** — OTP codes appear on screen.

### 3. Configure email delivery (free)
1. Enable **2FA** on your Gmail account
2. Generate an **App Password** at https://myaccount.google.com/apppasswords
3. Create `.env` in the project root:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-16-char-app-password
OTP_EMAIL_FROM=your.email@gmail.com
PORT=3000
```
4. Rebuild & restart:
```bash
npm run build
node server.mjs
```

Now OTPs will be delivered to users' email inboxes.

### 4. (Optional) Configure Twilio SMS
Add to `.env`:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

> All delivery methods stack — if both SMTP and Twilio are configured, the server attempts both. If none are configured, demo mode shows the code on screen.

---

## 📁 Project Structure

```
GetAuto/
├── public/
│   └── icons/              # PWA icons (SVG)
├── src/
│   ├── components/
│   │   ├── BookingForm.jsx  # Rental booking modal
│   │   ├── Navbar.jsx       # Top navigation bar
│   │   ├── RatingModal.jsx  # Star rating modal
│   │   └── VehicleCard.jsx  # Vehicle listing card
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state + OTP flow
│   ├── db/
│   │   └── database.js      # Dexie schema (IndexedDB)
│   ├── pages/
│   │   ├── Bookings.jsx     # Customer bookings
│   │   ├── Home.jsx         # Browse & filter vehicles
│   │   ├── Login.jsx        # Email OTP login
│   │   ├── MyVehicles.jsx   # Vendor dashboard
│   │   ├── Profile.jsx      # User profile
│   │   ├── Wishlist.jsx     # Saved vehicles
│   │   └── AddVehicle.jsx   # Vendor: list a vehicle
│   ├── App.jsx              # Root component + routes
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind imports
├── .env                     # SMTP / Twilio config (not committed)
├── .env.example             # Config template
├── .gitignore
├── index.html               # HTML shell
├── package.json
├── server.mjs               # Node.js HTTP server
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🗄 Database Schema

Dexie.js manages IndexedDB with 6 tables:

| Table | Key | Key Fields |
|-------|-----|------------|
| `users` | `++id, email` | name, role, createdAt |
| `vehicles` | `++id, ownerId` | type, name, variant, rentPerDay, location, isBooked |
| `bookings` | `++id, vehicleId, userId` | customerName, startDate, endDate, totalPrice, status |
| `otps` | `++id, email` | code, expiresAt |
| `wishlist` | `++id, userId, vehicleId` | createdAt |
| `ratings` | `++id, vehicleId, userId` | rating (1–5), review, createdAt |

All data persists in the browser — clearing site data resets the app.

---

## 🌐 API

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/send-otp` | `{ "email": "..." }` | Generates + delivers 6-digit OTP |

Returns:
```json
{ "sent": true, "demo": false }      // Email/SMS delivered
{ "sent": false, "demo": true, "code": "123456" }  // Demo mode
```

---

## 🔧 Development

```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # Production build + PWA generation
node server.mjs   # Serve production build
```

The dev server (Vite on `:5173`) handles HMR. The production server (`server.mjs` on `:3000`) serves the built `dist/` folder with CORS + SPA fallback.

---

## 🧪 Testing

No automated tests yet. Manual testing flow:

1. Open app → enter email → get OTP → complete registration
2. As **vendor**: add a vehicle → see it in listings
3. As **customer**: browse → wishlist → book → rate
4. Check **vendor dashboard** for stats updates
5. Verify **service worker** — install prompt, offline loading

---

## 🚧 Roadmap

- [ ] Phone number verification (add to existing email login)
- [ ] Image upload (instead of URL)
- [ ] Real-time availability calendar
- [ ] Admin panel
- [ ] Push notifications
- [ ] End-to-end tests

---

## 📄 License

MIT
