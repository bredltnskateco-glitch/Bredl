import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBox } from 'react-icons/fi';
import './CategoriesManager.css';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Streetwear', slug: 'streetwear', productCount: 156, description: 'Urban fashion and street style clothing' },
    { id: 2, name: 'Shoes', slug: 'shoes', productCount: 89, description: 'Skate shoes, sneakers, and footwear' },
    { id: 3, name: 'Accessories', slug: 'accessories', productCount: 124, description: 'Bags, hats, socks, and more' },
    { id: 4, name: 'Skate', slug: 'skate', productCount: 67, description: 'Skateboards, parts, and gear' },
    { id: 5, name: 'Surf', slug: 'surf', productCount: 32, description: 'Surfboards and surf apparel' },
    { id: 6, name: 'Snowboard', slug: 'snowboard', productCount: 18, description: 'Snowboards and winter gear' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }

    const slug = formData.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: formData.name, slug, description: formData.description }
          : cat
      ));
    } else {
      setCategories(prev => [...prev, {
        id: prev.length + 1,
        name: formData.name,
        slug,
        productCount: 0,
        description: formData.description
      }]);
    }

    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="categories-manager">
      {/* Header */}
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

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-icon">
              <FiBox />
            </div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <p className="category-slug">/{category.slug}</p>
              <p className="category-desc">{category.description}</p>
            </div>
            <div className="category-count">
              <span className="count">{category.productCount}</span>
              <span className="label">Products</span>
            </div>
            <div className="category-actions">
              <button className="action-btn edit" onClick={() => handleEdit(category)}>
                <FiEdit2 />
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(category.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingCategory(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditingCategory(null); }}>
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
              <button className="btn-cancel" onClick={() => { setShowModal(false); setEditingCategory(null); }}>
                Cancel
              </button>
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
