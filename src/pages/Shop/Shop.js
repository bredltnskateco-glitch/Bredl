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
import { productsApi, categoriesApi } from '../../api';
import { PRICE_RANGES } from '../../constants/shopFilters';
import { SPEC_FIELDS_BY_SUBCAT } from '../../constants/subcategorySpecs';
import './Shop.css';

const PAGE_SIZE = 12;

const normalizeProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  isOnSale: p.salePrice != null,
});

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Categories loaded once from API; cached client-side via categoriesApi memo.
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    category: category || 'all',
    subcategory: searchParams.get('subcategory') || 'all',
    brand: searchParams.get('brand') || 'all',
    price: 'all',
    sort: searchParams.get('sort') || 'newest',
    specFilters: {},
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (cancelled) return;
        const normalized = (data || []).map((c) => ({
          id: c.slug,
          name: c.name,
          subcategories: (c.subcategories || []).map((s) => ({ id: s.slug, name: s.name })),
        }));
        setCategories(normalized);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When the URL category changes (route param) or the subcategory/brand/sort
  // query params change, reflect that in active filters. Wait until categories
  // load so the slug can be validated.
  useEffect(() => {
    if (!categoriesLoaded) return;
    const valid = !category || categories.some((c) => c.id === category);
    const sub = searchParams.get('subcategory') || 'all';
    const brand = searchParams.get('brand') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const price = searchParams.get('price') || 'all';
    setActiveFilters((prev) => ({
      ...prev,
      category: valid && category ? category : 'all',
      subcategory: sub,
      brand,
      sort,
      price,
      specFilters: {},
    }));
    if (category && !expandedCategories.includes(category)) {
      setExpandedCategories((prev) => [...prev, category]);
    }
  }, [category, categoriesLoaded, searchParams]);

  const apiParams = useMemo(() => {
    const params = { limit: PAGE_SIZE, page };
    if (activeFilters.category && activeFilters.category !== 'all') {
      params.category = activeFilters.category;
    }
    if (activeFilters.subcategory && activeFilters.subcategory !== 'all') {
      params.subcategory = activeFilters.subcategory;
    }
    if (activeFilters.brand && activeFilters.brand !== 'all') {
      params.brand = activeFilters.brand;
    }
    if (activeFilters.sort && activeFilters.sort !== 'newest') {
      params.sort = activeFilters.sort;
    }
    if (activeFilters.price && activeFilters.price !== 'all') {
      const range = PRICE_RANGES.find((p) => p.id === activeFilters.price);
      if (range) {
        if (range.min != null) params.minPrice = range.min;
        if (range.max != null) params.maxPrice = range.max;
      }
    }
    Object.entries(activeFilters.specFilters || {}).forEach(([field, value]) => {
      if (value) params[`specs[${field}]`] = value;
    });
    return params;
  }, [activeFilters, page]);

  // Reset page to 1 whenever filters change (without depending on `page`).
  const filterKey = useMemo(() => JSON.stringify({
    c: activeFilters.category,
    s: activeFilters.subcategory,
    b: activeFilters.brand,
    p: activeFilters.price,
    o: activeFilters.sort,
    f: activeFilters.specFilters,
  }), [activeFilters]);

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  // Reflect filter state back into the URL so deep-links and the back button
  // stay consistent. Only writes query params; the route param (/shop/:category)
  // is handled by handleCategoryClick navigating directly.
  useEffect(() => {
    const next = new URLSearchParams();
    if (activeFilters.subcategory && activeFilters.subcategory !== 'all') {
      next.set('subcategory', activeFilters.subcategory);
    }
    if (activeFilters.brand && activeFilters.brand !== 'all') {
      next.set('brand', activeFilters.brand);
    }
    if (activeFilters.sort && activeFilters.sort !== 'newest') {
      next.set('sort', activeFilters.sort);
    }
    if (activeFilters.price && activeFilters.price !== 'all') {
      next.set('price', activeFilters.price);
    }
    const current = searchParams.toString();
    const target = next.toString();
    if (current !== target) {
      setSearchParams(next, { replace: true });
    }
  }, [activeFilters.subcategory, activeFilters.brand, activeFilters.sort, activeFilters.price, searchParams, setSearchParams]);

  // Fetch products on filter/page change.
  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    setProductsError('');
    (async () => {
      try {
        const data = await productsApi.list(apiParams);
        if (cancelled) return;
        const items = (Array.isArray(data) ? data : data.items || []).map(normalizeProduct);
        if (apiParams.page === 1) setProducts(items);
        else setProducts((prev) => [...prev, ...items]);
        setTotalPages(data.pages || 1);
        setTotal(data.total != null ? data.total : items.length);
      } catch (err) {
        if (!cancelled) setProductsError(err.message || 'Failed to load products');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiParams]);

  // Brand list shown in the filter sidebar — derived from currently visible
  // products. A future enhancement could call a dedicated /brands endpoint.
  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => { if (p.brand) set.add(p.brand); });
    return ['All Brands', ...Array.from(set).sort()];
  }, [products]);

  const availableSpecs = useMemo(() => {
    if (!activeFilters.subcategory || activeFilters.subcategory === 'all') return [];
    return SPEC_FIELDS_BY_SUBCAT[activeFilters.subcategory] || [];
  }, [activeFilters.subcategory]);

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleCategoryClick = (categoryId, subcategoryId = 'all') => {
    if (categoryId !== 'all' && !expandedCategories.includes(categoryId)) {
      setExpandedCategories((prev) => [...prev, categoryId]);
    }
    setActiveFilters((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: subcategoryId,
      specFilters: {},
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
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [filterOpen]);

  const handleSetActiveFilters = (next) => {
    const value = typeof next === 'function' ? next(activeFilters) : next;
    setActiveFilters(value);
  };

  const hasMore = page < totalPages;
  const handleLoadMore = () => setPage((p) => p + 1);

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
            productCount={total}
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
              categories={categories}
              brands={availableBrands}
              availableSpecs={availableSpecs}
            />

            <div className={`products-container ${viewMode}`}>
              {productsLoading && products.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading products…</p>
              ) : productsError ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#c00' }}>{productsError}</p>
              ) : products.length === 0 ? (
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
                        price: 'all',
                        sort: 'newest',
                        specFilters: {},
                      })
                    }
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`products-grid ${viewMode}`}>
                  {products.map((product) => (
                    <ShopProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              )}

              {hasMore && !productsLoading && (
                <div className="load-more">
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={handleLoadMore}
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
