import { useState, useEffect, useCallback, useRef } from 'react';
import websocketClient from '../services/websocketService';

export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [lastError, setLastError] = useState(null);
  const subscriptionsRef = useRef(new Set());

  // Initialize WebSocket connection
  const connect = useCallback((token) => {
    if (!token) {
      console.error('No token provided for WebSocket connection');
      return;
    }

    try {
      websocketClient.connect(token);
      setLastError(null);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setLastError(error.message);
    }
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    websocketClient.disconnect();
    setConnectionStatus('disconnected');
    setConnectedUsers(0);
    
    // Clear all subscriptions
    subscriptionsRef.current.clear();
  }, []);

  // Subscribe to events with automatic cleanup
  const subscribe = useCallback((event, callback) => {
    const unsubscribe = websocketClient.subscribe(event, callback);
    subscriptionsRef.current.add(unsubscribe);
    
    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(unsubscribe);
    };
  }, []);

  // Stock subscription methods
  const subscribeToStock = useCallback((symbol) => {
    websocketClient.subscribeToStock(symbol);
  }, []);

  const unsubscribeFromStock = useCallback((symbol) => {
    websocketClient.unsubscribeFromStock(symbol);
  }, []);

  // Order and portfolio subscriptions
  const subscribeToOrders = useCallback(() => {
    websocketClient.subscribeToOrders();
  }, []);

  const subscribeToPortfolio = useCallback(() => {
    websocketClient.subscribeToPortfolio();
  }, []);

  // Setup connection status listener
  useEffect(() => {
    const unsubscribe = websocketClient.subscribe('connection_status', (data) => {
      setConnectionStatus(data.status);
      if (data.connectedUsers) {
        setConnectedUsers(data.connectedUsers);
      }
      if (data.status === 'failed') {
        setLastError(data.message);
      }
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    // Connection methods
    connect,
    disconnect,
    subscribe,
    
    // Stock methods
    subscribeToStock,
    unsubscribeFromStock,
    
    // Other subscriptions
    subscribeToOrders,
    subscribeToPortfolio,
    
    // Status
    connectionStatus,
    connectedUsers,
    lastError,
    isConnected: connectionStatus === 'connected',
    
    // Utility
    emit: websocketClient.emit.bind(websocketClient),
    getConnectionStatus: websocketClient.getConnectionStatus.bind(websocketClient)
  };
};

// Hook for real-time stock prices
export const useStockPrices = (symbols = []) => {
  const [prices, setPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const { subscribe, subscribeToStock, unsubscribeFromStock, isConnected } = useWebSocket();

  // Subscribe to price updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('price_update', (data) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          timestamp: data.timestamp
        }
      }));
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [subscribe, isConnected]);

  // Subscribe to specific stocks
  useEffect(() => {
    if (!isConnected || symbols.length === 0) return;

    symbols.forEach(symbol => {
      subscribeToStock(symbol);
    });

    return () => {
      symbols.forEach(symbol => {
        unsubscribeFromStock(symbol);
      });
    };
  }, [symbols, subscribeToStock, unsubscribeFromStock, isConnected]);

  return {
    prices,
    lastUpdate,
    isConnected
  };
};

// Hook for real-time order updates
export const useOrderUpdates = () => {
  const [orderUpdates, setOrderUpdates] = useState([]);
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);
  const { subscribe, subscribeToOrders, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    subscribeToOrders();

    const unsubscribe = subscribe('order_update', (data) => {
      setOrderUpdates(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 updates
      setLastOrderUpdate(data);
    });

    return unsubscribe;
  }, [subscribe, subscribeToOrders, isConnected]);

  return {
    orderUpdates,
    lastOrderUpdate,
    isConnected
  };
};

// Hook for real-time notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep last 100
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
    });

    return unsubscribe;
  }, [subscribe, isConnected]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected
  };
};
