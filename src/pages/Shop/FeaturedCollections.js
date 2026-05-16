import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collectionsApi } from '../../api';
import { featuredCollections as fallbackCollections } from './shopData';
import './FeaturedCollections.css';

const normalize = (item, idx) => ({
  id: item._id || item.id || idx,
  title: item.title,
  subtitle: item.subtitle,
  image: item.image,
  to: item.href || item.to || '/shop',
});

const FeaturedCollections = () => {
  const [collections, setCollections] = useState(() => fallbackCollections.map(normalize));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await collectionsApi.list();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data.map(normalize));
        }
      } catch (_err) {
        // Keep fallback so the strip never disappears.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="featured-collections">
      <div className="container">
        <div className="collections-grid">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={collection.to || '/shop'}
              className="collection-card"
            >
              <div className="collection-image-wrapper">
                {collection.image && <img src={collection.image} alt={collection.title} loading="lazy" />}
                <div className="collection-overlay">
                  <h3>{collection.title}</h3>
                  {collection.subtitle && <p>{collection.subtitle}</p>}
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
