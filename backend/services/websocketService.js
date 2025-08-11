const { Server } = require('socket.io');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    // Initialize Socket.IO
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Initialize Redis clients
    this.redisPublisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    // Store connected users
    this.connectedUsers = new Map();
    
    this.setupSocketHandlers();
    this.setupRedisSubscriptions();
    this.startPriceSimulation();
  }

  // Authenticate WebSocket connections
  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  setupSocketHandlers() {
    // Authentication middleware
    this.io.use((socket, next) => this.authenticateSocket(socket, next));

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userEmail} (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        email: socket.userEmail,
        connectedAt: new Date()
      });

      // Join user to their personal room for notifications
      socket.join(`user_${socket.userId}`);
      
      // Join general market data room
      socket.join('market_data');

      // Handle subscription to specific stocks
      socket.on('subscribe_stock', (symbol) => {
        socket.join(`stock_${symbol}`);
        console.log(`User ${socket.userEmail} subscribed to ${symbol}`);
        
        // Send current price immediately
        this.sendCurrentPrice(socket, symbol);
      });

      // Handle unsubscription from stocks
      socket.on('unsubscribe_stock', (symbol) => {
        socket.leave(`stock_${symbol}`);
        console.log(`User ${socket.userEmail} unsubscribed from ${symbol}`);
      });

      // Handle order placement notifications
      socket.on('subscribe_orders', () => {
        socket.join(`orders_${socket.userId}`);
        console.log(`User ${socket.userEmail} subscribed to order updates`);
      });

      // Handle portfolio updates
      socket.on('subscribe_portfolio', () => {
        socket.join(`portfolio_${socket.userId}`);
        console.log(`User ${socket.userEmail} subscribed to portfolio updates`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userEmail}`);
        this.connectedUsers.delete(socket.userId);
      });

      // Send welcome message with connection stats
      socket.emit('connection_status', {
        status: 'connected',
        userId: socket.userId,
        connectedUsers: this.connectedUsers.size,
        timestamp: new Date()
      });
    });
  }

  setupRedisSubscriptions() {
    // Subscribe to price updates
    this.redisSubscriber.subscribe('price_updates', 'order_updates', 'portfolio_updates', 'notifications');

    this.redisSubscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'price_updates':
            this.handlePriceUpdate(data);
            break;
          case 'order_updates':
            this.handleOrderUpdate(data);
            break;
          case 'portfolio_updates':
            this.handlePortfolioUpdate(data);
            break;
          case 'notifications':
            this.handleNotification(data);
            break;
        }
      } catch (error) {
        console.error('Error processing Redis message:', error);
      }
    });
  }

  handlePriceUpdate(data) {
    const { symbol, price, change, changePercent, volume, timestamp } = data;
    
    // Broadcast to all users subscribed to this stock
    this.io.to(`stock_${symbol}`).emit('price_update', {
      symbol,
      price,
      change,
      changePercent,
      volume,
      timestamp
    });

    // Also broadcast to general market data room
    this.io.to('market_data').emit('market_tick', {
      symbol,
      price,
      change,
      changePercent,
      timestamp
    });
  }

  handleOrderUpdate(data) {
    const { userId, order, type } = data;
    
    // Send to specific user
    this.io.to(`user_${userId}`).emit('order_update', {
      type, // 'filled', 'partial', 'cancelled', 'placed'
      order,
      timestamp: new Date()
    });

    // Send notification
    this.sendNotification(userId, {
      type: 'order',
      title: `Order ${type}`,
      message: `Your ${order.side} order for ${order.quantity} ${order.symbol} has been ${type}`,
      data: order
    });
  }

  handlePortfolioUpdate(data) {
    const { userId, portfolio } = data;
    
    this.io.to(`portfolio_${userId}`).emit('portfolio_update', {
      portfolio,
      timestamp: new Date()
    });
  }

  handleNotification(data) {
    const { userId, notification } = data;
    this.sendNotification(userId, notification);
  }

  // Utility methods
  async sendCurrentPrice(socket, symbol) {
    try {
      // Try to get cached price from Redis
      const cachedPrice = await this.redisPublisher.get(`price_${symbol}`);
      
      if (cachedPrice) {
        const priceData = JSON.parse(cachedPrice);
        socket.emit('price_update', priceData);
      } else {
        // Generate mock price if not cached
        const mockPrice = this.generateMockPrice(symbol);
        socket.emit('price_update', mockPrice);
        
        // Cache the price
        await this.redisPublisher.setex(`price_${symbol}`, 60, JSON.stringify(mockPrice));
      }
    } catch (error) {
      console.error('Error sending current price:', error);
    }
  }

  generateMockPrice(symbol) {
    const basePrice = {
      'AAPL': 150,
      'GOOGL': 2800,
      'MSFT': 300,
      'TSLA': 800,
      'AMZN': 3200
    }[symbol] || 100;

    const change = (Math.random() - 0.5) * 10;
    const price = basePrice + change;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date()
    };
  }

  sendNotification(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      id: Date.now(),
      timestamp: new Date()
    });
  }

  // Public methods for other services to use
  async publishPriceUpdate(symbol, priceData) {
    // Cache the price
    await this.redisPublisher.setex(`price_${symbol}`, 60, JSON.stringify(priceData));
    
    // Publish to Redis
    await this.redisPublisher.publish('price_updates', JSON.stringify(priceData));
  }

  async publishOrderUpdate(userId, order, type) {
    await this.redisPublisher.publish('order_updates', JSON.stringify({
      userId,
      order,
      type
    }));
  }

  async publishPortfolioUpdate(userId, portfolio) {
    await this.redisPublisher.publish('portfolio_updates', JSON.stringify({
      userId,
      portfolio
    }));
  }

  async publishNotification(userId, notification) {
    await this.redisPublisher.publish('notifications', JSON.stringify({
      userId,
      notification
    }));
  }

  // Simulate real-time price updates
  startPriceSimulation() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
    
    setInterval(async () => {
      for (const symbol of symbols) {
        const priceData = this.generateMockPrice(symbol);
        await this.publishPriceUpdate(symbol, priceData);
      }
    }, 2000); // Update every 2 seconds

    console.log('🚀 Price simulation started - updating every 2 seconds');
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectedUsers: this.getConnectedUsers()
    };
  }
}

module.exports = WebSocketService;
