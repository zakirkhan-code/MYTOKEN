import io from 'socket.io-client';

// Get WebSocket URL from environment or use default
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5000';

let socket = null;

export function initializeSocket() {
  if (socket) return socket;

  socket = io(WEBSOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket Connected! ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket Connection Error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ WebSocket Disconnected:', reason);
  });

  return socket;
}

export function getSocket() {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default socket;