import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import { productsApi } from '../../api';
import './FeaturedProducts.css';

const FEATURED_LIMIT = 8;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productsApi.list({
          isFeatured: 'true',
          limit: FEATURED_LIMIT,
          sort: 'popular',
        });
        if (cancelled) return;
        const items = (res && res.items) || [];
        setProducts(items.map((it) => ({
          id: it._id,
          _id: it._id,
          name: it.name,
          category: it.category,
          image: it.image,
          hoverImage: it.hoverImage,
          regularPrice: it.price,
          price: it.price,
          salePrice: it.salePrice,
          isOnSale: !!it.salePrice,
          isNew: it.isNew,
          sizes: it.sizes,
          shoeSize: it.shoeSize,
        })));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load featured products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;
  if (error || products.length === 0) return null;

  return (
    <section className="featured-products" id="featured-products">
      <div className="container">
        <h2 className="section-title">FEATURED PRODUCTS</h2>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        <div className="section-cta">
          <Link to="/shop" className="btn-primary">
            SHOP ALL
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
