/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Use state for auth and user info
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserEmail('');
    setShowProfileMenu(false);
    navigate('/login');
  };

  // Listen for storage changes (other tabs/windows)
  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setIsAdmin(localStorage.getItem('role') === 'admin');
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Listen for location changes (route changes)
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setIsAdmin(localStorage.getItem('role') === 'admin');
    setUserEmail(localStorage.getItem('userEmail') || '');
    setShowProfileMenu(false); // close menu on route change
  }, [location]);

  useEffect(() => {
    // Close profile menu on outside click
    function handleClickOutside(event: MouseEvent) {
      const menu = document.querySelector('.profile-menu');
      if (menu && !menu.contains(event.target as Node) && !(event.target as Element).closest('.profile-button')) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className="w-full bg-white shadow-sm px-2 md:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="relative flex items-center group select-none">
          <span className="text-xl md:text-2xl font-serif text-blood-red-600 fade-in sewing-text">
            Serving "U"
          </span>
          {/* Needle SVG for animation */}
          <svg className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-6 h-6 needle-animate pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
            <path d="M12 2 L12 22" stroke="#991b1b" strokeWidth="2"/>
            <ellipse cx="12" cy="4" rx="1.5" ry="0.5" fill="#991b1b"/>
          </svg>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/laundry-service" className="text-gray-700 hover:text-blood-red-600 transition-colors">
            Laundry Service
          </Link>
          <Link to="/unstitched-clothes" className="text-gray-700 hover:text-blood-red-600 transition-colors">
            Unstitched Clothes
          </Link>
          <Link to="/alteration" className="text-gray-700 hover:text-blood-red-600 transition-colors">
            Book Alteration
          </Link>
          {isAdmin && (
            <Link to="/admin-editor" className="text-gray-700 hover:text-blood-red-600 transition-colors">
              Admin Editor
            </Link>
          )}
          {!isAdmin && isAuthenticated && (
            <Link to="/my-orders" className="text-gray-700 hover:text-blood-red-600 transition-colors">
              View My Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/orders" className="text-gray-700 hover:text-blood-red-600 transition-colors">
              Orders
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blood-red-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blood-red-600 transition-colors">
                Register
              </Link>
            </>
          ) : null}
        </nav>

        {/* Profile Icon (visible on both mobile and desktop) */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 border-none bg-transparent text-blood-red-600 font-bold focus:outline-none profile-button"
              style={{ boxShadow: 'none' }}
            >
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold bg-gradient-to-br from-yellow-400 via-yellow-500 to-blood-red-600 text-white relative">
                {userEmail.slice(0,2).toUpperCase() || 'U'}
              </span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col profile-menu">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-blood-red-600 font-semibold text-left text-inherit no-underline">Profile</Link>
                <div className="border-t" />
                <Link to="/laundry-service" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">Laundry Service</Link>
                <Link to="/unstitched-clothes" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">Unstitched Clothes</Link>
                <Link to="/alteration" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">Book Alteration</Link>
                {isAdmin && <Link to="/admin-editor" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">Admin Editor</Link>}
                {isAdmin && <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">Orders</Link>}
                {!isAdmin && isAuthenticated && <Link to="/my-orders" onClick={() => setShowProfileMenu(false)} className="px-4 py-3 hover:bg-yellow-50 text-left text-inherit no-underline">View My Orders</Link>}
                <button onClick={handleLogout} className="px-4 py-3 text-left hover:bg-yellow-50 text-blood-red-600 font-semibold">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1 text-blood-red-600 font-semibold rounded hover:underline"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1 text-blood-red-600 font-semibold rounded hover:underline"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
