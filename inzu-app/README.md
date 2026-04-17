# Inzu Platform — Phase 1

Rwanda real estate & rental web app with real-time booking.

## Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Phase 1 Features
- User registration & login (JWT)
- Property listings (apartments, houses, rooms)
- Real-time booking with Socket.IO
- Image uploads via Cloudinary
- Role-based access (user / owner / admin)
