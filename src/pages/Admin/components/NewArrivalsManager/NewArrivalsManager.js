import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiStar } from 'react-icons/fi';
import './NewArrivalsManager.css';

const NewArrivalsManager = () => {
  const [arrivals, setArrivals] = useState([
    {
      id: 1,
      name: 'BREDL SPORTECH TRACKSUIT JACKET BLACK',
      category: 'streetwear',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop',
      regularPrice: 139.00,
      salePrice: 125.10,
      isOnSale: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'NIKE SB DUNK LOW PRO',
      category: 'shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=600&fit=crop',
      regularPrice: 119.00,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45']
    },
    {
      id: 3,
      name: 'HOCKEY SKATEBOARDS DECK 8.25"',
      category: 'skate',
      image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=500&h=600&fit=crop',
      regularPrice: 85.00,
      salePrice: null,
      isOnSale: false,
      isNew: true,
      sizes: ['8.0"', '8.25"', '8.5"']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'streetwear',
    image: '',
    regularPrice: '',
    salePrice: '',
    isOnSale: false,
    isNew: true,
    sizes: ''
  });

  const categories = ['streetwear', 'shoes', 'skate', 'surf', 'accessories'];

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        image: item.image,
        regularPrice: item.regularPrice.toString(),
        salePrice: item.salePrice ? item.salePrice.toString() : '',
        isOnSale: item.isOnSale,
        isNew: item.isNew,
        sizes: item.sizes.join(', ')
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'streetwear',
        image: '',
        regularPrice: '',
        salePrice: '',
        isOnSale: false,
        isNew: true,
        sizes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      name: formData.name,
      category: formData.category,
      image: formData.image,
      regularPrice: parseFloat(formData.regularPrice),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      isOnSale: formData.isOnSale,
      isNew: formData.isNew,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s)
    };

    if (editingItem) {
      setArrivals(prev => prev.map(item => 
        item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
      ));
    } else {
      setArrivals(prev => [...prev, { ...itemData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setArrivals(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredArrivals = arrivals.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="arrivals-manager">
      {/* Header */}
      <div className="manager-header">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search new arrivals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FiPlus />
          Add New Arrival
        </button>
      </div>

      {/* Grid */}
      <div className="arrivals-grid">
        {filteredArrivals.map(item => (
          <div key={item.id} className="arrival-card">
            <div className="card-image">
              <img src={item.image} alt={item.name} />
              <div className="card-badges">
                {item.isNew && <span className="badge new">NEW</span>}
                {item.isOnSale && <span className="badge sale">SALE</span>}
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{item.name}</h3>
              <span className="card-category">{item.category}</span>
              <div className="card-price">
                {item.isOnSale && item.salePrice ? (
                  <>
                    <span className="price-sale">{item.salePrice.toFixed(2)} TND</span>
                    <span className="price-original">{item.regularPrice.toFixed(2)} TND</span>
                  </>
                ) : (
                  <span className="price-regular">{item.regularPrice.toFixed(2)} TND</span>
                )}
              </div>
              <div className="card-sizes">
                {item.sizes.slice(0, 4).map(size => (
                  <span key={size} className="size-tag">{size}</span>
                ))}
                {item.sizes.length > 4 && (
                  <span className="size-tag more">+{item.sizes.length - 4}</span>
                )}
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn edit" onClick={() => handleOpenModal(item)}>
                <FiEdit2 />
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit New Arrival' : 'Add New Arrival'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Regular Price (TND)</label>
                  <input
                    type="number"
                    name="regularPrice"
                    step="0.01"
                    value={formData.regularPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sale Price (TND)</label>
                  <input
                    type="number"
                    name="salePrice"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sizes (comma-separated)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleInputChange}
                  />
                  <span>Mark as New</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={formData.isOnSale}
                    onChange={handleInputChange}
                  />
                  <span>On Sale</span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingItem ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArrivalsManager;
