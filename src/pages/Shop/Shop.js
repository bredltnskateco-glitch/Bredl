import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QuickView from '../../components/QuickView/QuickView';
import ShopHero from './ShopHero';
import FeaturedCollections from './FeaturedCollections';
import TopBrands from './TopBrands';
import ShopToolbar from './ShopToolbar';
import ShopFilters from './ShopFilters';
import ShopProductCard from './ShopProductCard';
import ShopCategories from './ShopCategories';
import { categories } from './shopData';
import { productsApi } from '../../api';
import './Shop.css';

const normalizeProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  isOnSale: p.salePrice != null,
});

const PAGE_SIZE = 12;

const Shop = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await productsApi.list({ limit: 200 });
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data.items || [];
        setProducts(items.map(normalizeProduct));
      } catch (err) {
        if (!cancelled) setProductsError(err.message || 'Failed to load products');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const initialCategory = useMemo(() => {
    if (!category) return 'all';
    return categories.some((c) => c.id === category) ? category : 'all';
  }, [category]);

  const [expandedCategories, setExpandedCategories] = useState(
    initialCategory !== 'all' ? [initialCategory] : ['skate', 'streetwear'],
  );

  const [activeFilters, setActiveFilters] = useState(() => ({
    category: initialCategory,
    subcategory: 'all',
    brand: searchParams.get('brand') || 'all',
    size: 'all',
    price: 'all',
    sort: searchParams.get('sort') || 'newest',
  }));

  useEffect(() => {
    setActiveFilters((prev) => ({ ...prev, category: initialCategory, subcategory: 'all' }));
    setVisibleCount(PAGE_SIZE);
  }, [initialCategory]);

  useEffect(() => {
    const brand = searchParams.get('brand');
    if (brand) {
      setActiveFilters((prev) => (prev.brand === brand ? prev : { ...prev, brand }));
    }
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilters]);

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCategoryClick = (categoryId, subcategoryId = 'all') => {
    if (!expandedCategories.includes(categoryId)) {
      setExpandedCategories((prev) => [...prev, categoryId]);
    }
    setActiveFilters((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: subcategoryId,
    }));
    setFilterOpen(false);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  useEffect(() => {
    if (filterOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [filterOpen]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      if (activeFilters.category !== 'all' && product.category !== activeFilters.category) {
        return false;
      }
      if (
        activeFilters.subcategory !== 'all' &&
        product.subcategory !== activeFilters.subcategory
      ) {
        return false;
      }
      if (activeFilters.brand !== 'all') {
        const normalizedBrand = String(product.brand || '')
          .toLowerCase()
          .replace(/\s+/g, '-');
        const filterBrand = String(activeFilters.brand)
          .toLowerCase()
          .replace(/\s+/g, '-');
        if (normalizedBrand !== filterBrand) return false;
      }
      return true;
    });

    switch (activeFilters.sort) {
      case 'price-low':
        list = [...list].sort(
          (a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0),
        );
        break;
      case 'price-high':
        list = [...list].sort(
          (a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0),
        );
        break;
      case 'sale':
        list = list.filter((p) => p.isOnSale || p.salePrice);
        break;
      case 'popular':
        list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return list;
  }, [activeFilters, products]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length < filteredProducts.length;

  const handleSetActiveFilters = (next) => {
    const value = typeof next === 'function' ? next(activeFilters) : next;
    setActiveFilters(value);
  };

  return (
    <div className="shop-page">
      <ShopHero />

      <FeaturedCollections />

      <TopBrands />

      <section className="shop-main">
        <div className="container">
          <ShopToolbar
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeFilters={activeFilters}
            setActiveFilters={handleSetActiveFilters}
            productCount={filteredProducts.length}
          />

          <div className="shop-content">
            {filterOpen && (
              <div
                className="shop-filters-backdrop"
                onClick={() => setFilterOpen(false)}
                aria-hidden="true"
              />
            )}
            <ShopFilters
              filterOpen={filterOpen}
              setFilterOpen={setFilterOpen}
              activeFilters={activeFilters}
              setActiveFilters={handleSetActiveFilters}
              expandedCategories={expandedCategories}
              toggleCategoryExpand={toggleCategoryExpand}
              handleCategoryClick={handleCategoryClick}
            />

            <div className={`products-container ${viewMode}`}>
              {productsLoading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading products…</p>
              ) : productsError ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>{productsError}</p>
              ) : visibleProducts.length === 0 ? (
                <div className="shop-empty">
                  <p>No products match your filters.</p>
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={() =>
                      handleSetActiveFilters({
                        category: 'all',
                        subcategory: 'all',
                        brand: 'all',
                        size: 'all',
                        price: 'all',
                        sort: 'newest',
                      })
                    }
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`products-grid ${viewMode}`}>
                  {visibleProducts.map((product) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="load-more">
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ShopCategories />

      <QuickView
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
};

export default Shop;
