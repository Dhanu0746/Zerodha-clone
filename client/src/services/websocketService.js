import { io } from 'socket.io-client';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.socket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventHandlers();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('🚀 WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifySubscribers('connection_status', { status: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.notifySubscribers('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnection();
    });

    // Real-time data events
    this.socket.on('price_update', (data) => {
      this.notifySubscribers('price_update', data);
    });

    this.socket.on('market_tick', (data) => {
      this.notifySubscribers('market_tick', data);
    });

    this.socket.on('order_update', (data) => {
      this.notifySubscribers('order_update', data);
    });

    this.socket.on('portfolio_update', (data) => {
      this.notifySubscribers('portfolio_update', data);
    });

    this.socket.on('notification', (data) => {
      this.notifySubscribers('notification', data);
    });

    this.socket.on('connection_status', (data) => {
      console.log('Connection status:', data);
      this.notifySubscribers('connection_status', data);
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.socket.connect();
        }
      }, 2000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifySubscribers('connection_status', { 
        status: 'failed', 
        message: 'Unable to reconnect to server' 
      });
    }
  }

  // Subscription management
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventSubscribers = this.subscribers.get(event);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
        if (eventSubscribers.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  notifySubscribers(event, data) {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${event}:`, error);
        }
      });
    }
  }

  // Stock price subscriptions
  subscribeToStock(symbol) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_stock', symbol);
      console.log(`Subscribed to ${symbol} price updates`);
    }
  }

  unsubscribeFromStock(symbol) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_stock', symbol);
      console.log(`Unsubscribed from ${symbol} price updates`);
    }
  }

  // Order updates subscription
  subscribeToOrders() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_orders');
      console.log('Subscribed to order updates');
    }
  }

  // Portfolio updates subscription
  subscribeToPortfolio() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_portfolio');
      console.log('Subscribed to portfolio updates');
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscribers.clear();
      console.log('WebSocket disconnected manually');
    }
  }

  // Send custom events (if needed)
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;
