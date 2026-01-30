import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/genre-explorer', label: 'Genre Explorer', icon: '🎭' },
    { path: '/comic-hub', label: 'Comic Hub', icon: '🦸' },
    { path: '/bucket-list', label: 'My Letterbox', icon: '📖' },
    { path: '/history', label: 'History', icon: '📖' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          <span className="logo-text">BookFlix</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <div className="user-menu">
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="user-avatar"
            />
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <hr className="dropdown-divider" />
              <Link to="/profile" className="dropdown-item">
                <span>👤</span> Profile
              </Link>
              <button onClick={handleLogout} className="dropdown-item logout">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;