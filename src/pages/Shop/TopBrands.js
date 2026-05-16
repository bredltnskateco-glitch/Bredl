import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandsApi } from '../../api';
import { topBrands as fallbackBrands } from './shopData';
import './TopBrands.css';

const fallbackHref = (name) =>
  `/shop?brand=${encodeURIComponent(String(name || '').toLowerCase().replace(/\s+/g, '-'))}`;

const TopBrands = () => {
  const [brands, setBrands] = useState(() =>
    fallbackBrands.map((b, idx) => ({ id: idx, name: b.name, href: fallbackHref(b.name) })),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await brandsApi.featuredList();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data.map((b) => ({
            id: b._id,
            name: b.name,
            href: b.href || fallbackHref(b.name),
            logo: b.logo,
          })));
        }
      } catch (_err) {
        // keep fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="top-brands">
      <div className="container">
        <h2 className="section-title">TOP BRANDS</h2>
        <div className="brands-grid">
          {brands.map((brand) => (
            <Link key={brand.id} to={brand.href} className="brand-item">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} loading="lazy" />
              ) : (
                <span>{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
