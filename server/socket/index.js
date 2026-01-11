import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

let io = null;
const userSocketMap = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Authenticate user via token passed from client
    socket.on('authenticate', (token) => {
      const decoded = verifyToken(token);
      
      if (decoded && decoded.userId) {
        const userId = decoded.userId;
        userSocketMap.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} authenticated and mapped to socket ${socket.id}`);
        
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { success: false, message: 'Invalid token' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

export const getSocketIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return null;
  }
  
  // Add helper method to emit to specific user
  io.emitToUser = (userId, event, data) => {
    const socketId = userSocketMap.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
      console.log(`Emitted ${event} to user ${userId} (socket ${socketId})`);
      return true;
    } else {
      console.log(`User ${userId} not connected`);
      return false;
    }
  };
  
  return io;
};
