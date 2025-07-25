# Zerodha Clone Backend

This backend powers the Zerodha clone project using Node.js, Express, and MongoDB (MERN stack).

## Features
- User authentication (signup, login, JWT)
- User profile/account management
- Stock data (fetch/display, simulated or via API)
- Order placement (buy/sell simulation)
- Order history/portfolio
- Funds management (simulated)

## Structure
- `controllers/` — Request handling logic
- `models/` — Mongoose schemas (User, Order, Stock, etc.)
- `routes/` — API endpoints
- `middleware/` — Auth, error handling, etc.
- `config/` — DB connection and config
- `utils/` — Helper functions
- `.env` — Environment variables
- `server.js` — Entry point

## Setup
1. `npm install`
2. Create a `.env` file (see `.env.example`)
3. `npm start`

---

This backend is designed to support all interactive features visible on the frontend Zerodha clone. 