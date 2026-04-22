# Kreative Salon Backend

## Setup
1. Open this folder in terminal
2. Run:
   npm install
3. Copy `.env.example` to `.env`
4. Put your MongoDB connection string in `.env`
5. Run:
   npm run dev

## Seed sample data
Run:
npm run seed

## API endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Services
- GET `/api/services`
- GET `/api/services/admin/all` (admin)
- POST `/api/services` (admin)
- PUT `/api/services/:id` (admin)
- DELETE `/api/services/:id` (admin)

### Bookings
- POST `/api/bookings`
- GET `/api/bookings/my`
- GET `/api/bookings` (admin)
- PUT `/api/bookings/:id/status` (admin)

## Sample login
- Admin: `admin@kreative.com` / `admin123`
- User: `hari@example.com` / `user123`
