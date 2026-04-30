import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import logoIcon from '../../assets/icons/12.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartCount = totalItems || 0;

  return (
    <header className="header">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logoIcon} alt="AgroLink Logo" className="logo-icon" />
          Agro<span>Link</span>
        </Link>

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About Us</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/app">App</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>

          {user ? (
            <div className="user-menu">
              <Link to="/cart" className="cart-icon">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="user-dropdown">
                <button className="user-btn">
                  <i className="fas fa-user"></i>
                  <span>{user.fullName?.split(' ')[0]}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>
                <div className="dropdown-content">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/chat">Messages</Link>
                  {user.role === 'farmer' && (
                    <Link to="/products/add">Add Product</Link>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Sign Up</Link>
            </div>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;