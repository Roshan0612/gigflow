import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { getMe } from './store/authSlice';
import { connectSocket } from './utils/socket';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import GigFeed from './pages/GigFeed';
import PostGig from './pages/PostGig';
import GigDetail from './pages/GigDetail';
import MyGigs from './pages/MyGigs';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckRan = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckRan.current) return;
    authCheckRan.current = true;

    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      try {
        await dispatch(getMe()).unwrap();
        // Connect socket using HttpOnly cookie (no token needed)
        try {
          connectSocket();
        } catch (socketError) {
          console.error('Socket connection failed:', socketError);
        }
      } catch (error) {
        // User not authenticated
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Show loading only during initial auth check
  if (!authChecked) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-slate-700">Loading GigFlow...</p>
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
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />
        <Route 
          path="/post-gig" 
          element={
            <ProtectedRoute>
              <PostGig />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-gigs" 
          element={
            <ProtectedRoute>
              <MyGigs />
            </ProtectedRoute>
          } 
        />
        <Route path="/gig/:id" element={<GigDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
