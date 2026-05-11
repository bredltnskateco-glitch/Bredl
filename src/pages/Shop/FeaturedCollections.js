import React from 'react';
import { Link } from 'react-router-dom';
import { featuredCollections } from './shopData';
import './FeaturedCollections.css';

const FeaturedCollections = () => {
  return (
    <section className="featured-collections">
      <div className="container">
        <div className="collections-grid">
          {featuredCollections.map((collection) => (
            <Link
              key={collection.id}
              to={collection.to || '/shop'}
              className="collection-card"
            >
              <div className="collection-image-wrapper">
                <img src={collection.image} alt={collection.title} loading="lazy" />
                <div className="collection-overlay">
                  <h3>{collection.title}</h3>
                  <p>{collection.subtitle}</p>
                  <span className="collection-cta">Shop Now →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
