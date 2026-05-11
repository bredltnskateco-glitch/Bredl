import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import AddProductModal from './AddProductModal';
import { productsApi } from '../../../../api';
import './ProductsManager.css';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Streetwear', 'Shoes', 'Accessories', 'Skate', 'Surf', 'Snowboard'];

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsApi.list({ limit: 500 });
      setProducts(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSaveProduct = async (productData, editId) => {
    try {
      if (editId) {
        const updated = await productsApi.update(editId, productData);
        setProducts((prev) => prev.map((p) => (p._id === editId ? updated : p)));
      } else {
        const created = await productsApi.create(productData);
        setProducts((prev) => [created, ...prev]);
      }
      setEditingProduct(null);
    } catch (err) {
      alert(err.message || 'Save failed');
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
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' ||
      product.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const computedStatus = (p) => {
    if (p.status) return p.status;
    if (p.stock === 0) return 'Out of Stock';
    if (p.stock <= 20) return 'Low Stock';
    return 'Active';
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active': return 'status-active';
      case 'low stock': return 'status-low';
      case 'out of stock': return 'status-out';
      default: return '';
    }
  };

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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
          <FiPlus />
          Add Product
        </button>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const status = computedStatus(product);
                return (
                  <tr key={product._id}>
                    <td>
                      <div className="product-cell">
                        <img src={product.image} alt={product.name} className="product-thumb" />
                        <span className="product-name">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="price-cell">{Number(product.price || 0).toFixed(2)} TND</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => handleEditProduct(product)}>
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteProduct(product._id)}>
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
