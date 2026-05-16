import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../../api';
import './ShopCategories.css';

const ShopCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (!cancelled) setCategories(data || []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="shop-categories">
      <div className="container">
        <h2 className="section-title">SHOP BY CATEGORY</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category._id || category.slug}
              to={`/shop/${category.slug}`}
              className="category-card"
            >
              <span className="category-name">{category.name}</span>
              <span className="category-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
