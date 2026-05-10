import React, { useState } from 'react';
import QuickView from '../../components/QuickView/QuickView';
import ShopHero from './ShopHero';
import FeaturedCollections from './FeaturedCollections';
import TopBrands from './TopBrands';
import ShopToolbar from './ShopToolbar';
import ShopFilters from './ShopFilters';
import ShopProductCard from './ShopProductCard';
import ShopCategories from './ShopCategories';
import { products } from './shopData';
import './Shop.css';

const Shop = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['skate', 'streetwear']);
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    subcategory: 'all',
    brand: 'all',
    size: 'all',
    price: 'all',
    sort: 'newest'
  });

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (categoryId, subcategoryId = 'all') => {
    // Also expand the category when clicking on it
    if (!expandedCategories.includes(categoryId)) {
      setExpandedCategories(prev => [...prev, categoryId]);
    }
    setActiveFilters(prev => ({
      ...prev,
      category: categoryId,
      subcategory: subcategoryId
    }));
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const filteredProducts = products.filter(product => {
    if (activeFilters.category !== 'all' && product.category !== activeFilters.category) {
      return false;
    }
    if (activeFilters.subcategory !== 'all' && product.subcategory !== activeFilters.subcategory) {
      return false;
    }
    if (activeFilters.brand !== 'all' && product.brand !== activeFilters.brand) {
      return false;
    }
    return true;
  });

  return (
    <div className="shop-page">
      {/* Hero Banner */}
      <ShopHero />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* Top Brands */}
      <TopBrands />

      {/* Main Shop Section */}
      <section className="shop-main">
        <div className="container">
          {/* Toolbar */}
          <ShopToolbar
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            productCount={filteredProducts.length}
          />

          <div className="shop-content">
            {/* Sidebar Filters */}
            <ShopFilters
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              expandedCategories={expandedCategories}
              toggleCategoryExpand={toggleCategoryExpand}
              handleCategoryClick={handleCategoryClick}
            />

            {/* Product Grid */}
            <div className={`products-container ${viewMode}`}>
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map((product) => (
                  <ShopProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="load-more">
                <button className="load-more-btn">Load More Products</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <ShopCategories />

      {/* Quick View Modal */}
      <QuickView 
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
};

export default Shop;
