import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiStar } from 'react-icons/fi';
import { newArrivalsApi } from '../../../../api';
import { formatCurrency } from '../../utils/format';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './NewArrivalsManager.css';

const NewArrivalsManager = () => {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await newArrivalsApi.list();
      setArrivals(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load new arrivals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
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
        sizes: (item.sizes || []).join(', ')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = {
      name: formData.name,
      category: formData.category,
      image: formData.image,
      regularPrice: parseFloat(formData.regularPrice),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      isOnSale: formData.isOnSale,
      isNew: formData.isNew,
      sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingItem) {
        const updated = await newArrivalsApi.update(editingItem._id, itemData);
        setArrivals((prev) => prev.map((item) =>
          item._id === editingItem._id ? { ...item, ...updated } : item,
        ));
        toast.success('New arrival updated');
      } else {
        const created = await newArrivalsApi.create(itemData);
        setArrivals((prev) => [created, ...prev]);
        toast.success('New arrival created');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this new arrival? It will disappear from the home page carousel.')) return;
    try {
      await newArrivalsApi.remove(id);
      setArrivals((prev) => prev.filter((item) => item._id !== id));
      toast.success('New arrival deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
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

      {loading && <p>Loading new arrivals...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filteredArrivals.length === 0 && (
        <EmptyState
          icon={FiStar}
          title={arrivals.length === 0 ? 'No new arrivals yet' : 'No arrivals match your search'}
          hint={
            arrivals.length === 0
              ? 'Add a new arrival — it will appear in the carousel on the home page and as a shop entry point.'
              : 'Try a different search term.'
          }
          actionLabel={arrivals.length === 0 ? 'Add new arrival' : undefined}
          onAction={arrivals.length === 0 ? () => handleOpenModal() : undefined}
        />
      )}

      {/* Grid */}
      <div className="arrivals-grid">
        {filteredArrivals.map((item) => (
          <div key={item._id} className="arrival-card">
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
                    <span className="price-sale">{formatCurrency(item.salePrice, { decimals: 2 })}</span>
                    <span className="price-original">{formatCurrency(item.regularPrice, { decimals: 2 })}</span>
                  </>
                ) : (
                  <span className="price-regular">{formatCurrency(item.regularPrice, { decimals: 2 })}</span>
                )}
              </div>
              <div className="card-sizes">
                {(item.sizes || []).slice(0, 4).map((size) => (
                  <span key={size} className="size-tag">{size}</span>
                ))}
                {(item.sizes || []).length > 4 && (
                  <span className="size-tag more">+{item.sizes.length - 4}</span>
                )}
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn edit" onClick={() => handleOpenModal(item)}>
                <FiEdit2 />
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(item._id)}>
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
