import React from 'react';
import { FiGrid, FiList, FiFilter, FiChevronDown } from 'react-icons/fi';
import { SORT_OPTIONS as sortOptions } from '../../constants/shopFilters';
import './ShopToolbar.css';

const ShopToolbar = ({
  filterOpen,
  setFilterOpen,
  viewMode,
  setViewMode,
  activeFilters,
  setActiveFilters,
  productCount
}) => {
  return (
    <div className="shop-toolbar">
      <div className="toolbar-left">
        <button 
          className="filter-toggle"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <FiFilter size={18} />
          <span>Filters</span>
        </button>
        <span className="product-count">{productCount} Products</span>
      </div>
      <div className="toolbar-right">
        <div className="sort-dropdown">
          <label>Sort by:</label>
          <select 
            value={activeFilters.sort}
            onChange={(e) => setActiveFilters({...activeFilters, sort: e.target.value})}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          <FiChevronDown className="dropdown-icon" />
        </div>
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <FiGrid size={18} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <FiList size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopToolbar;
