# Kreative Salon Authentication System

## Backend (already complete in kreative-salon-backend/kreative-salon-backend/)

**Packages already installed (check package.json):**
- bcryptjs
- jsonwebtoken
- mongoose

**Env:**
```
JWT_SECRET=your_secret_key_here
```

**Test APIs (Postman):**
1. POST http://localhost:5000/api/auth/register
```
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```
2. POST /api/auth/login `{ "email": "test@example.com", "password": "123456" }`
3. GET /api/auth/me `Authorization: Bearer YOUR_TOKEN`

**Seed data:**
cd kreative-salon-backend/kreative-salon-backend
node seed/seedData.js
- Admin: admin@kreative.com / admin123
- User: hari@example.com / user123

**Run backend:**
cd kreative-salon-backend/kreative-salon-backend && npm start

## Frontend

**Files updated/created:**
- assets/js/auth.js (service)
- assets/js/app.js (integrated)
- login.html (toggle login/signup)
- All HTML navbars (dynamic)
- Protected body classes on booking/my-bookings/admin.html

**Test in browser:**
1. Open index.html (or any page)
2. Navbar shows Home/Services/Login/Signup
3. Click Login/Signup -> toggle login mode, login with seeded user
4. Redirect my-bookings.html, navbar changes to logged (Booking/My Bookings/Logout)
5. Refresh persists login
6. Admin signup/login -> Admin link shows
7. Try access admin.html as user -> denied redirect
8. Logout -> back to public navbar

**Backend URL:** Edit API_BASE = 'http://localhost:5000/api' in auth.js if port different.

Auth complete! Backend full working, frontend dynamic nav/persist/redirect/protect/role-based.

