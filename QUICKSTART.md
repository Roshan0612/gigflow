# 🚀 Quick Start Guide

## Installation Steps

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Setup MongoDB

**Option A - Local MongoDB:**
```bash
# Start MongoDB
mongod
```

**Option B - MongoDB Atlas (Recommended for transactions):**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGO_URI in server/.env

### 3. Configure Environment

The `.env` file is already created in `server/` with default values:
```env
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

⚠️ **Important:** Change JWT_SECRET for production!

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🎯 Testing the Application

### Test Scenario 1: Basic Flow

1. **Register User 1** (Client)
   - Go to http://localhost:5173/register
   - Register with name: "John Client"

2. **Post a Gig**
   - Click "Post Gig"
   - Title: "Build a landing page"
   - Budget: 500
   - Submit

3. **Logout** and **Register User 2** (Freelancer)
   - Register with name: "Jane Freelancer"

4. **Browse and Bid**
   - Click on the gig
   - Submit a bid with your proposal and price

5. **Login as User 1** (Client)
   - View the gig you posted
   - See the bid from Jane
   - Click "Hire This Freelancer"

6. **Check Real-time Notification**
   - User 2 (Jane) will receive instant toast notification!

### Test Scenario 2: Race Condition Safety

1. Open two browser windows (or incognito)
2. Login as the gig owner in both
3. Navigate to the same gig with pending bids
4. Try to hire different freelancers simultaneously
5. ✅ Only ONE hire succeeds, preventing data corruption!

## 📱 Key Features to Test

- ✅ JWT Authentication (check cookies in DevTools)
- ✅ Search gigs by title
- ✅ Multiple bids on same gig (different users)
- ✅ Prevent duplicate bids (same user, same gig)
- ✅ Real-time Socket.io notifications
- ✅ Atomic hiring with MongoDB transactions
- ✅ Protected routes (try accessing /post-gig without login)

## 🔧 Development Commands

### Backend
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🐛 Common Issues

**Issue:** "Cannot connect to MongoDB"
**Solution:** Ensure MongoDB is running or use MongoDB Atlas

**Issue:** "Socket not connecting"
**Solution:** Verify backend is running on port 5000

**Issue:** "Transactions not supported"
**Solution:** Use MongoDB replica set or Atlas (required for transactions)

**Issue:** "Cookies not being set"
**Solution:** Clear browser cache and ensure CORS is configured correctly

## 🎨 Tech Stack Recap

- **Frontend:** React 18 + Vite + Tailwind + Redux Toolkit
- **Backend:** Node.js + Express + MongoDB + Mongoose
- **Auth:** JWT in HttpOnly cookies (not localStorage)
- **Real-time:** Socket.io
- **State:** Redux Toolkit with async thunks

## 📚 Next Steps

1. Customize the UI with your own styles
2. Add user profiles
3. Add payment integration
4. Add file upload for gig attachments
5. Add messaging between users
6. Add reviews and ratings

---

Enjoy building with GigFlow! 🎉
