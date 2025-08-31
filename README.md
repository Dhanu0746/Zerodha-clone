# Zerodha Clone - Full-Stack Trading Platform

A feature-rich stock trading platform inspired by Zerodha, built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and enhanced with real-time features using WebSocket and Redis.

![Zerodha Clone Dashboard](https://via.placeholder.com/1200x600/1a202c/ffffff?text=Zerodha+Clone+Dashboard)

## 🚀 Features

### 📊 Trading & Portfolio
- Real-time stock price updates
- Buy/Sell market and limit orders
- Portfolio tracking with P&L calculation
- Order book visualization
- Watchlist management
- Historical trade data

### 🔒 Security
- JWT Authentication
- Two-Factor Authentication (2FA)
- Secure password hashing
- Rate limiting and account lockout
- Session management

### 🤖 AI Integration
- AI-powered trading insights
- Stock recommendation engine
- Market sentiment analysis
- Trade execution suggestions

### 📱 Real-time Features
- Live price updates via WebSocket
- Instant order execution
- Real-time notifications
- Live market depth
- Portfolio value updates

## 🛠 Tech Stack

### Frontend
- React.js 18
- Vite.js
- Tailwind CSS
- Chart.js / Recharts
- Socket.io Client
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Redis (Caching & Pub/Sub)
- JWT Authentication
- WebSocket Server

### DevOps
- Docker
- Environment Configuration
- API Rate Limiting
- Error Tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zerodha-clone.git
   cd zerodha-clone
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in both `backend` and `client` directories
   - Update the environment variables with your configuration

4. **Start the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # In a new terminal, start frontend
   cd client
   npm run dev
   ```

## 📚 API Documentation

Detailed API documentation is available at `/api-docs` when running the development server.

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens with expiration
- Rate limiting on authentication endpoints
- CSRF protection
- Secure HTTP headers
- Input validation and sanitization

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd ../client
npm test
```



## 🙏 Acknowledgements

- Zerodha for the inspiration
- Finnhub API for market data
- Various open-source libraries and tools


