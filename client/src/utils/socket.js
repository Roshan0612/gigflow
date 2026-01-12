import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

// Socket authentication now relies on HttpOnly cookie; no token is passed from client
export const connectSocket = () => {
  if (socket) {
    return socket;
  }

  const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  socket = io(socketURL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('hired_notification', (data) => {
    console.log('Received hire notification:', data);
    toast.success(data.message, {
      duration: 5000,
      position: 'top-right'
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
