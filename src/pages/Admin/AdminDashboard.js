import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiUsers, FiBox, FiTag,
  FiBarChart2, FiSettings, FiMenu, FiEye,
  FiStar, FiFileText, FiShield, FiAlertTriangle
} from 'react-icons/fi';

// Import components
import Sidebar from './components/Sidebar/Sidebar';
import DashboardOverview from './components/DashboardOverview/DashboardOverview';
import ProductsManager from './components/ProductsManager/ProductsManager';
import OrdersManager from './components/OrdersManager/OrdersManager';
import CustomersManager from './components/CustomersManager/CustomersManager';
import CategoriesManager from './components/CategoriesManager/CategoriesManager';
import AnalyticsDashboard from './components/AnalyticsDashboard/AnalyticsDashboard';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import NewArrivalsManager from './components/NewArrivalsManager/NewArrivalsManager';
import NewsManager from './components/NewsManager/NewsManager';
import MfaPanel from './components/MfaPanel/MfaPanel';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const mfaRequired = user?.role === 'admin' && !user?.mfaEnabled;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'products', label: 'Products', icon: FiBox },
    { id: 'newarrivals', label: 'New Arrivals', icon: FiStar },
    { id: 'news', label: 'News', icon: FiFileText },
    { id: 'customers', label: 'Customers', icon: FiUsers },
    { id: 'categories', label: 'Categories', icon: FiTag },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'security', label: 'Security (MFA)', icon: FiShield },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductsManager />;
      case 'newarrivals':
        return <NewArrivalsManager />;
      case 'news':
        return <NewsManager />;
      case 'orders':
        return <OrdersManager />;
      case 'customers':
        return <CustomersManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'security':
        return <MfaPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`admin-main ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu />
            </button>
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          <div className="header-right">
            <Link to="/" className="view-store-btn">
              <FiEye />
              View Store
            </Link>
          </div>
        </header>

        {mfaRequired && activeTab !== 'security' && (
          <div
            role="alert"
            style={{
              margin: '12px 24px 0',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#9a3412',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
            }}
          >
            <FiAlertTriangle />
            <span>
              Multi-factor authentication is required for admins. Write actions
              are blocked until you enable it.
            </span>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                marginLeft: 'auto',
                background: '#9a3412',
                color: '#fff',
                border: 0,
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Set up now
            </button>
          </div>
        )}

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
