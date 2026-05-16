import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiUsers, FiBox, FiTag,
  FiBarChart2, FiSettings, FiMenu, FiEye,
  FiStar, FiFileText, FiShield, FiAlertTriangle,
  FiPercent, FiLayers, FiAward,
} from 'react-icons/fi';

// Import components
import Sidebar from './components/Sidebar/Sidebar';
import DashboardOverview from './components/DashboardOverview/DashboardOverview';
import ProductsManager from './components/ProductsManager/ProductsManager';
import OrdersManager from './components/OrdersManager/OrdersManager';
import CustomersManager from './components/CustomersManager/CustomersManager';
import CategoriesManager from './components/CategoriesManager/CategoriesManager';
import CollectionsManager from './components/CollectionsManager/CollectionsManager';
import BrandsManager from './components/BrandsManager/BrandsManager';
import AnalyticsDashboard from './components/AnalyticsDashboard/AnalyticsDashboard';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import NewArrivalsManager from './components/NewArrivalsManager/NewArrivalsManager';
import NewsManager from './components/NewsManager/NewsManager';
import PromosManager from './components/PromosManager/PromosManager';
import MfaPanel from './components/MfaPanel/MfaPanel';
import { ToastContainer } from './components/Toast/Toast';

import './styles/admin-shared.css';
import './AdminDashboard.css';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'orders', label: 'Orders', icon: FiShoppingBag },
  { id: 'products', label: 'Products', icon: FiBox },
  { id: 'categories', label: 'Categories', icon: FiTag },
  { id: 'collections', label: 'Collections', icon: FiLayers },
  { id: 'brands', label: 'Brands', icon: FiAward },
  { id: 'newarrivals', label: 'New Arrivals', icon: FiStar },
  { id: 'news', label: 'News', icon: FiFileText },
  { id: 'customers', label: 'Customers', icon: FiUsers },
  { id: 'promos', label: 'Promos', icon: FiPercent },
  { id: 'security', label: 'Security (MFA)', icon: FiShield },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const menuItemIds = new Set(menuItems.map((item) => item.id));

const getTabFromPath = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'admin') return 'dashboard';
  return parts[1] || 'dashboard';
};

const getTabPath = (id) => (id === 'dashboard' ? '/admin' : `/admin/${id}`);

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 768;
  });
  const [activeTab, setActiveTab] = useState(() => {
    const pathTab = getTabFromPath(location.pathname);
    return menuItemIds.has(pathTab) ? pathTab : 'dashboard';
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    const pathTab = getTabFromPath(location.pathname);
    if (!menuItemIds.has(pathTab)) {
      navigate('/admin', { replace: true });
      return;
    }
    setActiveTab((current) => (current === pathTab ? current : pathTab));
  }, [location.pathname, navigate]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (sidebarOpen && window.innerWidth <= 768) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [sidebarOpen]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(getTabPath(id));
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const mfaRequired = user?.role === 'admin' && !user?.mfaEnabled;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'products':
        return <ProductsManager />;
      case 'collections':
        return <CollectionsManager />;
      case 'brands':
        return <BrandsManager />;
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
      case 'promos':
        return <PromosManager />;
      case 'security':
        return <MfaPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile sidebar backdrop */}
      <div
        className="admin-sidebar-backdrop"
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
              onClick={() => handleTabChange('security')}
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
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
