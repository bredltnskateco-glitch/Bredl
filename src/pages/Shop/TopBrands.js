import React from 'react';
import { Link } from 'react-router-dom';
import { topBrands } from './shopData';
import './TopBrands.css';

const TopBrands = () => {
  return (
    <section className="top-brands">
      <div className="container">
        <h2 className="section-title">TOP BRANDS</h2>
        <div className="brands-grid">
          {topBrands.map((brand, index) => (
            <Link
              key={index}
              to={`/shop?brand=${encodeURIComponent(brand.name.toLowerCase().replace(/\s+/g, '-'))}`}
              className="brand-item"
            >
              <span>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
