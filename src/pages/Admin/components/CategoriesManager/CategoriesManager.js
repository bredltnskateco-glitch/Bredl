import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBox } from 'react-icons/fi';
import { categoriesApi } from '../../../../api';
import './CategoriesManager.css';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        const updated = await categoriesApi.update(editingCategory._id, {
          name: formData.name,
          description: formData.description,
        });
        setCategories((prev) =>
          prev.map((c) => (c._id === editingCategory._id ? { ...c, ...updated } : c)),
        );
      } else {
        const created = await categoriesApi.create({
          name: formData.name,
          description: formData.description,
        });
        setCategories((prev) => [...prev, { ...created, productCount: 0 }]);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.remove(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="categories-manager">
      <div className="categories-header">
        <div className="header-info">
          <h2>Product Categories</h2>
          <p>Manage your store's product categories</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FiPlus />
          Add Category
        </button>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category._id} className="category-card">
              <div className="category-icon">
                <FiBox />
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p className="category-slug">/{category.slug}</p>
                <p className="category-desc">{category.description}</p>
              </div>
              <div className="category-count">
                <span className="count">{category.productCount || 0}</span>
                <span className="label">Products</span>
              </div>
              <div className="category-actions">
                <button className="action-btn edit" onClick={() => handleEdit(category)}>
                  <FiEdit2 />
                </button>
                <button className="action-btn delete" onClick={() => handleDelete(category._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                {editingCategory ? 'Update' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
