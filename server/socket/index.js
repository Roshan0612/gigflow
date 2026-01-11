import { Server } from 'socket.io';
import cookie from 'cookie';
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

  // Authenticate sockets using HttpOnly cookie from the handshake
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers?.cookie;
      if (!rawCookie) return next(new Error('No auth cookie'));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.token;
      if (!token) return next(new Error('No token'));

      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) return next(new Error('Invalid token'));

      socket.userId = decoded.userId;
      return next();
    } catch (err) {
      return next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Map authenticated userId to socketId
    if (socket.userId) {
      userSocketMap.set(socket.userId, socket.id);
      console.log(`User ${socket.userId} authenticated and mapped to socket ${socket.id}`);
    }

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
