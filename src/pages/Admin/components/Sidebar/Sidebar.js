import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMenu, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  menuItems, 
  activeTab, 
  onTabChange, 
  user, 
  onLogout 
}) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <Link to="/" className="admin-logo">
          <span className="logo-text">BREDL</span>
          <span className="logo-admin">ADMIN</span>
        </Link>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-user">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
