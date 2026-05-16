import React from 'react';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { PRICE_RANGES } from '../../constants/shopFilters';
import { SPEC_OPTIONS, SPEC_LABELS } from '../../constants/subcategorySpecs';
import './ShopFilters.css';

const ALL_CATEGORIES_ENTRY = { id: 'all', name: 'All Products', subcategories: [] };

const ShopFilters = ({
  filterOpen,
  setFilterOpen,
  activeFilters,
  setActiveFilters,
  expandedCategories,
  toggleCategoryExpand,
  handleCategoryClick,
  categories = [],
  brands = [],
  availableSpecs = [],
}) => {
  const fullCategories = [ALL_CATEGORIES_ENTRY, ...categories];

  const setSpecFilter = (field, value) => {
    setActiveFilters((prev) => {
      const current = (prev.specFilters || {})[field];
      const next = { ...(prev.specFilters || {}) };
      if (current === value) delete next[field];
      else next[field] = value;
      return { ...prev, specFilters: next };
    });
  };

  return (
    <aside className={`shop-sidebar ${filterOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button className="close-filters" onClick={() => setFilterOpen(false)}>
          <FiX size={20} />
        </button>
      </div>

      <div className="filter-group">
        <h4>Category</h4>
        <ul className="filter-list">
          {fullCategories.map((category) => (
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
                <span
                  className={`filter-text ${activeFilters.category === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <FiChevronDown
                    size={12}
                    className={`filter-arrow ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}
                  />
                )}
              </div>
              {category.subcategories
                && category.subcategories.length > 0
                && expandedCategories.includes(category.id) && (
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

      {availableSpecs.length > 0 && (
        <div className="filter-group">
          <h4>Specifications</h4>
          {availableSpecs.map((field) => {
            const options = SPEC_OPTIONS[field];
            if (!options || options.length === 0) return null;
            const selected = (activeFilters.specFilters || {})[field];
            return (
              <div key={field} className="filter-subgroup">
                <h5 className="filter-subtitle">{SPEC_LABELS[field] || field}</h5>
                <ul className="filter-list">
                  {options.map((opt) => (
                    <li key={opt}>
                      <button
                        className={`filter-text ${selected === opt ? 'active' : ''}`}
                        onClick={() => setSpecFilter(field, opt)}
                      >
                        {opt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="filter-group">
        <h4>Brand</h4>
        <ul className="filter-list scrollable">
          {brands.map((brand) => {
            const isAll = brand === 'All Brands';
            const isActive = isAll
              ? activeFilters.brand === 'all'
              : activeFilters.brand === brand;
            return (
              <li key={brand}>
                <button
                  className={`filter-text ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveFilters({
                    ...activeFilters,
                    brand: isAll ? 'all' : brand,
                  })}
                >
                  {brand}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="filter-group">
        <h4>Price</h4>
        <ul className="filter-list">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <button
                className={`filter-text ${activeFilters.price === range.id ? 'active' : ''}`}
                onClick={() => setActiveFilters({ ...activeFilters, price: range.id })}
              >
                {range.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="clear-filters"
        onClick={() => setActiveFilters({
          category: 'all',
          subcategory: 'all',
          brand: 'all',
          price: 'all',
          sort: 'newest',
          specFilters: {},
        })}
      >
        Clear All Filters
      </button>
    </aside>
  );
};

export default ShopFilters;
