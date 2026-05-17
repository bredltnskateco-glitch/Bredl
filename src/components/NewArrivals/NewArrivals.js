import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import { newArrivalsApi } from '../../api';
import './NewArrivals.css';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await newArrivalsApi.list();
        if (cancelled) return;
        const items = Array.isArray(res) ? res : [];
        setProducts(items.map((it) => ({
          id: it.product || it._id,
          _id: it._id,
          name: it.name,
          category: it.category,
          image: it.image,
          hoverImage: it.hoverImage,
          regularPrice: it.regularPrice,
          salePrice: it.salePrice,
          isOnSale: it.isOnSale,
          isNew: it.isNew,
          sizes: it.sizes,
        })));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load new arrivals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="new-arrivals" id="new-arrivals">
      <div className="container">
        <h2 className="section-title">NEW ARRIVALS</h2>

        {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {error && <p style={{ textAlign: 'center', color: '#c00' }}>{error}</p>}

        {!loading && !error && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} minimal />
            ))}
          </div>
        )}

        <div className="section-cta">
          <Link to="/shop" className="btn-primary">
            BREDL COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
