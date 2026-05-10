import React from 'react';
import { featuredCollections } from './shopData';
import './FeaturedCollections.css';

const FeaturedCollections = () => {
  return (
    <section className="featured-collections">
      <div className="container">
        <div className="collections-grid">
          {featuredCollections.map((collection) => (
            <a key={collection.id} href={collection.link} className="collection-card">
              <div className="collection-image-wrapper">
                <img src={collection.image} alt={collection.title} />
                <div className="collection-overlay">
                  <h3>{collection.title}</h3>
                  <p>{collection.subtitle}</p>
                  <span className="collection-cta">Shop Now →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
