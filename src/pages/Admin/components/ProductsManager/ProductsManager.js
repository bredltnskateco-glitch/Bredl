import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter,
  FiChevronUp, FiChevronDown, FiBox,
} from 'react-icons/fi';
import AddProductModal from './AddProductModal';
import { productsApi, categoriesApi } from '../../../../api';
import { formatCurrency } from '../../utils/format';
import { getStatusClass, getProductStockStatus } from '../../utils/status';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './ProductsManager.css';

const PAGE_SIZE = 24;

const SORT_FIELDS = [
  { key: 'name', label: 'Product' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
];

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Load categories once (cached client-side via the API memo).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (!cancelled) setCategories(data || []);
      } catch (_) { /* keep filter as-is */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchPage = useCallback(async (pageNum, { append = false } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, limit: PAGE_SIZE, sort: `${sortKey}:${sortDir}` };
      if (filterCategory !== 'all') params.category = filterCategory;
      const data = await productsApi.list(params);
      const items = Array.isArray(data) ? data : data.items || [];
      setTotalPages(data.pages || 1);
      setTotal(data.total != null ? data.total : items.length);
      setProducts((prev) => (append ? [...prev, ...items] : items));
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [filterCategory, sortKey, sortDir]);

  // Reset to page 1 whenever sort or filter changes.
  useEffect(() => {
    setPage(1);
    fetchPage(1, { append: false });
  }, [fetchPage]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, { append: true });
  };

  const handleSaveProduct = async (productData, editId) => {
    try {
      if (editId) {
        const updated = await productsApi.update(editId, productData);
        setProducts((prev) => prev.map((p) => (p._id === editId ? updated : p)));
        toast.success('Product updated');
      } else {
        const created = await productsApi.create(productData);
        setProducts((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        toast.success('Product created');
      }
      setEditingProduct(null);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product, id: product._id });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected product${selectedIds.size === 1 ? '' : 's'}? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    let failed = 0;
    await Promise.all(ids.map(async (id) => {
      try { await productsApi.remove(id); } catch (_) { failed++; }
    }));
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p._id)));
    setSelectedIds(new Set());
    setTotal((t) => Math.max(0, t - (ids.length - failed)));
    if (failed === 0) toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} deleted`);
    else toast.error(`${ids.length - failed} deleted, ${failed} failed`);
  };

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [products, searchTerm]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const hasMore = page < totalPages;
  const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p._id));

  return (
    <div className="products-manager">
      <div className="products-header">
        <div className="search-filter">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FiFilter />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="products-header-actions">
          {selectedIds.size > 0 && (
            <button className="admin-btn admin-btn-danger" onClick={handleBulkDelete}>
              <FiTrash2 />
              Delete ({selectedIds.size})
            </button>
          )}
          <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <EmptyState
          icon={FiBox}
          title={total === 0 ? 'No products yet' : 'No products match your search'}
          hint={
            total === 0
              ? 'Add your first product — it will appear in the storefront grid and on the home page.'
              : 'Try a different search term or clear the category filter.'
          }
          actionLabel={total === 0 ? 'Add product' : undefined}
          onAction={total === 0 ? () => setShowAddModal(true) : undefined}
        />
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="admin-data-table products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th className="select-col">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {SORT_FIELDS.map((f) => (
                    <th
                      key={f.key}
                      className="sortable"
                      onClick={() => handleSort(f.key)}
                      aria-sort={sortKey === f.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span className="sortable-inner">{f.label} {sortIcon(f.key)}</span>
                    </th>
                  ))}
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = product.status || getProductStockStatus(product.stock);
                  const checked = selectedIds.has(product._id);
                  return (
                    <tr key={product._id} className={checked ? 'selected' : ''}>
                      <td data-label="" className="select-col">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={checked}
                          onChange={() => toggleSelect(product._id)}
                        />
                      </td>
                      <td data-label="Product">
                        <div className="product-cell">
                          <img src={product.image} alt={product.name} className="product-thumb" />
                          <span className="product-name">{product.name}</span>
                        </div>
                      </td>
                      <td className="price-cell" data-label="Price">
                        {formatCurrency(product.price, { decimals: 2 })}
                      </td>
                      <td data-label="Stock">{product.stock ?? '—'}</td>
                      <td data-label="Category">{product.category || '—'}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${getStatusClass(status)}`}>{status}</span>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <button className="action-btn edit" aria-label="Edit product" onClick={() => handleEditProduct(product)}>
                            <FiEdit2 />
                          </button>
                          <button className="action-btn delete" aria-label="Delete product" onClick={() => handleDeleteProduct(product._id)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="products-footer">
            <span className="products-count">
              Showing {products.length} of {total} product{total === 1 ? '' : 's'}
            </span>
            {hasMore && (
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </>
      )}

      <AddProductModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductsManager;
