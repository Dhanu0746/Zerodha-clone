# Zerodha Clone - Setup Guide

## Prerequisites

- Node.js 16+ 
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn

## Quick Setup

### 1. Environment Configuration

**Backend Setup:**
```bash
cd backend
cp env.example .env
# Edit .env with your configuration
```

**Frontend Setup:**
```bash
cd client
cp env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../client
npm install
```

### 3. Database Setup

```bash
# Start MongoDB (if not running)
mongod

# Start Redis (if not running)
redis-server
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/zerodha-clone
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
FINNHUB_API_KEY=your-finnhub-key
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## Features to Test

1. **User Registration/Login**
2. **Two-Factor Authentication**
3. **Real-time Stock Prices**
4. **Order Placement**
5. **Portfolio Management**
6. **AI Trading Insights**

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env

2. **Redis Connection Error**
   - Ensure Redis is running
   - Check REDIS_URL in .env

3. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Check frontend API_BASE_URL

4. **WebSocket Connection Issues**
   - Ensure backend is running on correct port
   - Check VITE_WS_URL in frontend .env

## Production Deployment

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure proper CORS origins
4. Set up SSL certificates
5. Use environment-specific database URLs
