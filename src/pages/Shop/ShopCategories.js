import React from 'react';
import { categories } from './shopData';
import './ShopCategories.css';

const ShopCategories = () => {
  return (
    <section className="shop-categories">
      <div className="container">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div className="categories-grid">
          {categories.filter(c => c.id !== 'all').map((category) => (
            <a key={category.id} href={`#${category.id}`} className="category-card">
              <span className="category-name">{category.name}</span>
              <span className="category-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
