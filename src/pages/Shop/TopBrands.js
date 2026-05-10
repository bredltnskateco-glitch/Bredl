import React from 'react';
import { topBrands } from './shopData';
import './TopBrands.css';

const TopBrands = () => {
  return (
    <section className="top-brands">
      <div className="container">
        <h2 className="section-title">TOP BRANDS</h2>
        <div className="brands-grid">
          {topBrands.map((brand, index) => (
            <a key={index} href={`#brand-${brand.name}`} className="brand-item">
              <span>{brand.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
