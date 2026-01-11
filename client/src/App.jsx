import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { getMe } from './store/authSlice';
import { connectSocket } from './utils/socket';
import api from './utils/api';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import GigFeed from './pages/GigFeed';
import PostGig from './pages/PostGig';
import GigDetail from './pages/GigDetail';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      try {
        await dispatch(getMe()).unwrap();
        
        // If authenticated, connect socket
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        
        if (token) {
          connectSocket(token);
        }
      } catch (error) {
        // User not authenticated
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/" element={<GigFeed />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />
        <Route 
          path="/post-gig" 
          element={
            <ProtectedRoute>
              <PostGig />
            </ProtectedRoute>
          } 
        />
        <Route path="/gig/:id" element={<GigDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
