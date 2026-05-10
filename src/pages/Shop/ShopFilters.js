import React from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { categories, brands, sizes, priceRanges } from './shopData';
import './ShopFilters.css';

const ShopFilters = ({
  filterOpen,
  setFilterOpen,
  activeFilters,
  setActiveFilters,
  expandedCategories,
  toggleCategoryExpand,
  handleCategoryClick
}) => {
  return (
    <aside className={`shop-sidebar ${filterOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button className="close-filters" onClick={() => setFilterOpen(false)}>
          <FiX size={20} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <h4>Category</h4>
        <ul className="filter-list">
          {categories.map((category) => (
            <li key={category.id}>
              <div 
                className="filter-item-row"
                onClick={() => {
                  if (category.subcategories && category.subcategories.length > 0) {
                    toggleCategoryExpand(category.id);
                  }
                  handleCategoryClick(category.id);
                }}
              >
                <span className={`filter-text ${activeFilters.category === category.id ? 'active' : ''}`}>
                  {category.name}
                </span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <FiChevronDown 
                    size={12} 
                    className={`filter-arrow ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}
                  />
                )}
              </div>
              {category.subcategories && category.subcategories.length > 0 && expandedCategories.includes(category.id) && (
                <ul className="subcategory-list">
                  {category.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <button 
                        className={`filter-text ${activeFilters.subcategory === sub.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(category.id, sub.id);
                        }}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Brand Filter */}
      <div className="filter-group">
        <h4>Brand</h4>
        <ul className="filter-list scrollable">
          {brands.map((brand, index) => (
            <li key={index}>
              <button 
                className={`filter-text ${activeFilters.brand === brand || (brand === 'All Brands' && activeFilters.brand === 'all') ? 'active' : ''}`}
                onClick={() => setActiveFilters({...activeFilters, brand: brand === 'All Brands' ? 'all' : brand})}
              >
                {brand}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Size Filter */}
      <div className="filter-group">
        <h4>Size</h4>
        <div className="size-grid">
          {sizes.map((size, index) => (
            <button 
              key={index}
              className={`size-btn ${activeFilters.size === size || (size === 'All Sizes' && activeFilters.size === 'all') ? 'active' : ''}`}
              onClick={() => setActiveFilters({...activeFilters, size: size === 'All Sizes' ? 'all' : size})}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="filter-group">
        <h4>Price</h4>
        <ul className="filter-list">
          {priceRanges.map((range) => (
            <li key={range.id}>
              <button 
                className={`filter-text ${activeFilters.price === range.id ? 'active' : ''}`}
                onClick={() => setActiveFilters({...activeFilters, price: range.id})}
              >
                {range.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      <button 
        className="clear-filters"
        onClick={() => setActiveFilters({
          category: 'all',
          subcategory: 'all',
          brand: 'all',
          size: 'all',
          price: 'all',
          sort: 'newest'
        })}
      >
        Clear All Filters
      </button>
    </aside>
  );
};

export default ShopFilters;
