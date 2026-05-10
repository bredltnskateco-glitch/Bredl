import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Header from './components/Header/Header';
import CartDrawer from './components/CartDrawer/CartDrawer';
import Wishlist from './components/Wishlist/Wishlist';
import HeroSlider from './components/HeroSlider/HeroSlider';
import NewArrivals from './components/NewArrivals/NewArrivals';
import Departments from './components/Departments/Departments';
import News from './components/News/News';
import Newsletter from './components/Newsletter/Newsletter';
import Footer from './components/Footer/Footer';
import Shop from './pages/Shop/Shop';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

// Home Page Component
const HomePage = () => (
  <>
    <HeroSlider />
    <NewArrivals />
    <Departments />
    <News />
    <Newsletter />
  </>
);

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout wrapper for pages with header/footer
const MainLayout = ({ children, showHeader }) => (
  <>
    <Header isVisible={showHeader} />
    <CartDrawer />
    <Wishlist />
    <main>{children}</main>
    <Footer />
  </>
);

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Slight delay before showing header for smooth transition
    setTimeout(() => {
      setShowHeader(true);
    }, 100);
  };

  // Check if user has already seen the loading screen this session
  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setIsLoading(false);
      setShowHeader(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      sessionStorage.setItem('hasSeenLoading', 'true');
    }
  }, [isLoading]);

  return (
    <div className="App">
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}
      <Routes>
        {/* Admin Route - No header/footer */}
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* Public Routes with Header/Footer */}
        <Route path="/" element={<MainLayout showHeader={showHeader}><HomePage /></MainLayout>} />
        <Route path="/shop" element={<MainLayout showHeader={showHeader}><Shop /></MainLayout>} />
        <Route path="/shop/:category" element={<MainLayout showHeader={showHeader}><Shop /></MainLayout>} />
        <Route path="/login" element={<MainLayout showHeader={showHeader}><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout showHeader={showHeader}><Register /></MainLayout>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
