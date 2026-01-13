import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { store } from '../store/store';
import { addGig } from '../store/gigSlice';

let socket = null;

// Socket authentication now relies on HttpOnly cookie; no token is passed from client
export const connectSocket = () => {
  if (socket) {
    console.log('Socket already connected:', socket.id);
    return socket;
  }

  const socketURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  console.log('Connecting to socket server:', socketURL);
  
  socket = io(socketURL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected successfully:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('hired_notification', (data) => {
    console.log('Received hire notification:', data);
    toast.success(data.message, {
      duration: 5000,
      position: 'top-right'
    });
  });

  socket.on('new_bid', (data) => {
    console.log('Received new bid notification:', data);
    toast.success(data.message, {
      duration: 4000,
      position: 'top-right'
    });
  });

  socket.on('gig_updated', (data) => {
    console.log('Received gig update notification:', data);
    if (data.message) {
      toast.info(data.message, {
        duration: 4000,
        position: 'top-right'
      });
    }
  });

  socket.on('gig_created', (gig) => {
    console.log('Received new gig via socket:', gig);
    try {
      store.dispatch(addGig(gig));
    } catch (err) {
      console.error('Error dispatching addGig from socket:', err);
    }
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
