/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail'); // Remove userEmail on logout
    navigate('/login');
  };

  // Helper to close profile menu and navigate
  const handleProfileMenuNav = (to: string) => {
    setShowProfileMenu(false);
    navigate(to);
  };

  useEffect(() => {
    // Close profile menu on outside click
    function handleClickOutside(event: MouseEvent) {
      const menu = document.querySelector('.z-50');
      if (menu && !menu.contains(event.target as Node)) {
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
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 border-none bg-transparent text-blood-red-600 font-bold focus:outline-none"
                style={{ boxShadow: 'none' }}
              >
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold bg-gradient-to-br from-yellow-400 via-yellow-500 to-blood-red-600 text-white relative">
                  {userEmail.slice(0,2).toUpperCase() || 'U'}
                </span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col">
                  <button onClick={() => handleProfileMenuNav('/profile')} className="px-4 py-3 hover:bg-yellow-50 text-blood-red-600 font-semibold text-left">Profile</button>
                  <div className="border-t" />
                  <button onClick={() => handleProfileMenuNav('/laundry-service')} className="px-4 py-3 hover:bg-yellow-50 text-left">Laundry Service</button>
                  <button onClick={() => handleProfileMenuNav('/unstitched-clothes')} className="px-4 py-3 hover:bg-yellow-50 text-left">Unstitched Clothes</button>
                  <button onClick={() => handleProfileMenuNav('/alteration')} className="px-4 py-3 hover:bg-yellow-50 text-left">Book Alteration</button>
                  {isAdmin && <button onClick={() => handleProfileMenuNav('/admin-editor')} className="px-4 py-3 hover:bg-yellow-50 text-left">Admin Editor</button>}
                  {isAdmin && <button onClick={() => handleProfileMenuNav('/orders')} className="px-4 py-3 hover:bg-yellow-50 text-left">Orders</button>}
                  {!isAdmin && isAuthenticated && <button onClick={() => handleProfileMenuNav('/my-orders')} className="px-4 py-3 hover:bg-yellow-50 text-left">View My Orders</button>}
                  <button onClick={handleLogout} className="px-4 py-3 text-left hover:bg-yellow-50 text-blood-red-600 font-semibold">Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Profile Logo as Menu */}
        <div className="md:hidden flex items-center">
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 border-none bg-transparent text-blood-red-600 font-bold focus:outline-none"
                style={{ boxShadow: 'none' }}
              >
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold bg-gradient-to-br from-yellow-400 via-yellow-500 to-blood-red-600 text-white relative">
                  {userEmail.slice(0,2).toUpperCase() || 'U'}
                </span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col">
                  <button onClick={() => handleProfileMenuNav('/profile')} className="px-4 py-3 hover:bg-yellow-50 text-blood-red-600 font-semibold text-left">Profile</button>
                  <div className="border-t" />
                  <button onClick={() => handleProfileMenuNav('/laundry-service')} className="px-4 py-3 hover:bg-yellow-50 text-left">Laundry Service</button>
                  <button onClick={() => handleProfileMenuNav('/unstitched-clothes')} className="px-4 py-3 hover:bg-yellow-50 text-left">Unstitched Clothes</button>
                  <button onClick={() => handleProfileMenuNav('/alteration')} className="px-4 py-3 hover:bg-yellow-50 text-left">Book Alteration</button>
                  {isAdmin && <button onClick={() => handleProfileMenuNav('/admin-editor')} className="px-4 py-3 hover:bg-yellow-50 text-left">Admin Editor</button>}
                  {isAdmin && <button onClick={() => handleProfileMenuNav('/orders')} className="px-4 py-3 hover:bg-yellow-50 text-left">Orders</button>}
                  {!isAdmin && isAuthenticated && <button onClick={() => handleProfileMenuNav('/my-orders')} className="px-4 py-3 hover:bg-yellow-50 text-left">View My Orders</button>}
                  <button onClick={handleLogout} className="px-4 py-3 text-left hover:bg-yellow-50 text-blood-red-600 font-semibold">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;