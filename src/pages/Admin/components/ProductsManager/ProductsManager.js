import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiImage, FiX } from 'react-icons/fi';
import AddProductModal from './AddProductModal';
import './ProductsManager.css';

const ProductsManager = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Nike SB Dunk Low Pro', category: 'Shoes', price: 120.00, stock: 45, status: 'Active', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100' },
    { id: 2, name: 'Palace Tri-Ferg Tee', category: 'Streetwear', price: 85.00, stock: 120, status: 'Active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' },
    { id: 3, name: 'Supreme Box Logo Hoodie', category: 'Streetwear', price: 300.00, stock: 15, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100' },
    { id: 4, name: 'Thrasher Flame Logo Tee', category: 'Streetwear', price: 35.00, stock: 200, status: 'Active', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=100' },
    { id: 5, name: 'Vans Old Skool Pro', category: 'Shoes', price: 80.00, stock: 78, status: 'Active', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100' },
    { id: 6, name: 'Santa Cruz Complete', category: 'Skate', price: 180.00, stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=100' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Streetwear', 'Shoes', 'Accessories', 'Skate', 'Surf', 'Snowboard'];

  const handleSaveProduct = (productData, editId) => {
    if (editId) {
      setProducts(prev => prev.map(p => 
        p.id === editId ? { ...productData, id: editId } : p
      ));
    } else {
      const newProduct = {
        ...productData,
        id: products.length + 1
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'low stock': return 'status-low';
      case 'out of stock': return 'status-out';
      default: return '';
    }
  };

  return (
    <div className="products-manager">
      {/* Header Actions */}
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
              {categories.map(cat => (
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

      {/* Products Table */}
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
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <img src={product.image} alt={product.name} className="product-thumb" />
                    <span className="product-name">{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td className="price-cell">{product.price.toFixed(2)} TND</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => handleEditProduct(product)}>
                      <FiEdit2 />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteProduct(product.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
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
