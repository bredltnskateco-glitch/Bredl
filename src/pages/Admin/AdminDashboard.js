import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiUsers, FiBox, FiTag,
  FiBarChart2, FiSettings, FiMenu, FiEye, FiPlus,
  FiStar, FiFileText
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

import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'products', label: 'Products', icon: FiBox },
    { id: 'newarrivals', label: 'New Arrivals', icon: FiStar },
    { id: 'news', label: 'News', icon: FiFileText },
    { id: 'customers', label: 'Customers', icon: FiUsers },
    { id: 'categories', label: 'Categories', icon: FiTag },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
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

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
