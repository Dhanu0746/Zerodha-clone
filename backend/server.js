const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/tradingroutes');
const userRoutes = require('./routes/userRoutes');
const orderBookRoute = require('./routes/orderbook'); 
const orderRoutes = require('./routes/OrderRoutes');
const marketRoutes = require('./routes/marketroutes');

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/2fa', require('./routes/twoFactorRoutes'));
app.use("/api/holding", require("./routes/holding"));
app.use("/api/order", require("./routes/order"));
app.use("/api/funds", require("./routes/funds"));
app.use("/api/stock", require("./routes/stock"));
app.use("/api/ai", require("./routes/ai"));
app.use('/api', tradingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orderbook', orderBookRoute);
app.use('/api/orders', orderRoutes);
app.use('/api/market', marketRoutes);

// Initialize WebSocket service
const WebSocketService = require('./services/websocketService');
let websocketService;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  
  // Initialize WebSocket service after DB connection
  websocketService = new WebSocketService(server);
  
  // Make websocket service available globally
  app.set('websocketService', websocketService);
  
  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
    console.log('🚀 WebSocket service initialized');
    console.log('📡 Redis pub/sub ready for real-time updates');
  });
}).catch((err) => console.error(err));
