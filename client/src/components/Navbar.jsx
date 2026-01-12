import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { logout } from '../store/authSlice';
import { disconnectSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      disconnectSocket();
      toast.success('Logged out successfully');
      setShowMenu(false);
      navigate('/login');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0" onClick={() => setShowMobileMenu(false)}>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg sm:text-xl px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg group-hover:shadow-lg transition-all duration-200">
              G
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              GigFlow
            </span>
          </Link>

          {/* Center Navigation - for authenticated users (hidden on mobile) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 flex-1 justify-center px-6 lg:px-8">
              <Link
                to="/"
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                Browse Gigs
              </Link>
              <Link
                to="/my-gigs"
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                My Gigs
              </Link>
            </div>
          )}

          {/* Navigation - Right */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/post-gig"
                  className="hidden sm:inline-block px-3 sm:px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow text-sm"
                >
                  Post Gig
                </Link>
                
                {/* Settings Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                    title="Settings"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-40">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm text-slate-500">Signed in as</p>
                        <p className="font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                      </div>

                      {/* My Gigs */}
                      <Link
                        to="/my-gigs"
                        onClick={() => setShowMenu(false)}
                        className="block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 flex items-center space-x-3 text-slate-700 hover:text-indigo-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span className="font-medium">My Gigs</span>
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-slate-100 my-2"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="sm:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors duration-200 text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow text-sm sm:text-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && showMobileMenu && (
          <div className="sm:hidden border-t border-slate-200 py-4 space-y-3">
            <Link
              to="/post-gig"
              className="block px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 text-center"
              onClick={() => setShowMobileMenu(false)}
            >
              Post Gig
            </Link>
            <Link
              to="/"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Browse Gigs
            </Link>
            <Link
              to="/my-gigs"
              className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200 font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              My Gigs
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
