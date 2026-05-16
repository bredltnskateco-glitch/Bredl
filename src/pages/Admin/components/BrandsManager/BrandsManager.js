import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiAward, FiStar } from 'react-icons/fi';
import { brandsApi } from '../../../../api';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './BrandsManager.css';

const EMPTY = () => ({
  name: '',
  logo: '',
  href: '',
  featured: true,
  order: 0,
});

const BrandsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY());
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await brandsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((b) =>
    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY());
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      logo: item.logo || '',
      href: item.href || '',
      featured: !!item.featured,
      order: item.order || 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order' ? Number(value) : value),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Brand name is required'); return; }
    try {
      if (editing) {
        const updated = await brandsApi.update(editing._id, form);
        setItems((prev) => prev.map((b) => (b._id === editing._id ? updated : b)));
        toast.success('Brand updated');
      } else {
        const created = await brandsApi.create(form);
        setItems((prev) => [created, ...prev]);
        toast.success('Brand created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand? Featured brand strip and Footer brand column will update.')) return;
    try {
      await brandsApi.remove(id);
      setItems((prev) => prev.filter((b) => b._id !== id));
      toast.success('Brand deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const updated = await brandsApi.update(item._id, { featured: !item.featured });
      setItems((prev) => prev.map((b) => (b._id === item._id ? updated : b)));
      toast.success(item.featured ? 'Removed from featured strip' : 'Now featured on the Shop page');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <div className="brands-manager">
      <div className="manager-header">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={openCreate}>
          <FiPlus />
          Add Brand
        </button>
      </div>

      {loading && <p>Loading brands…</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={FiAward}
          title={items.length === 0 ? 'No brands yet' : 'No brands match your search'}
          hint={
            items.length === 0
              ? 'Add a brand — featured brands appear in the Shop page Top Brands strip and the Footer brand column.'
              : 'Try a different search term.'
          }
          actionLabel={items.length === 0 ? 'Add brand' : undefined}
          onAction={items.length === 0 ? openCreate : undefined}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="brands-grid">
          {filtered.map((b) => (
            <div key={b._id} className={`brand-card ${b.featured ? 'featured' : ''}`}>
              <div className="brand-card-top">
                <button
                  type="button"
                  className={`brand-feature-btn ${b.featured ? 'active' : ''}`}
                  aria-label={b.featured ? 'Remove from featured' : 'Mark as featured'}
                  title={b.featured ? 'Remove from featured' : 'Mark as featured'}
                  onClick={() => toggleFeatured(b)}
                >
                  <FiStar />
                </button>
                <span className="brand-order">#{b.order ?? 0}</span>
              </div>
              <div className="brand-card-body">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="brand-logo" />
                ) : (
                  <span className="brand-name-fallback">{b.name}</span>
                )}
                <h3 className="brand-name">{b.name}</h3>
                <p className="brand-href">{b.href}</p>
              </div>
              <div className="brand-actions">
                <button className="action-btn edit" aria-label="Edit brand" onClick={() => openEdit(b)}>
                  <FiEdit2 />
                </button>
                <button className="action-btn delete" aria-label="Delete brand" onClick={() => handleDelete(b._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editing ? 'Edit brand' : 'New brand'}</h2>
              <button className="admin-modal-close" aria-label="Close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required autoFocus />
                </div>
                <div className="admin-form-group">
                  <label>Logo URL</label>
                  <input type="url" name="logo" value={form.logo} onChange={handleChange} placeholder="https://..." />
                  {form.logo && <img src={form.logo} alt="" className="brand-image-preview" />}
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Shop link (optional)</label>
                    <input type="text" name="href" value={form.href} onChange={handleChange} placeholder="/shop?brand=..." />
                  </div>
                  <div className="admin-form-group">
                    <label>Order</label>
                    <input type="number" name="order" value={form.order} onChange={handleChange} min="0" />
                  </div>
                </div>
                <label className="inline-checkbox">
                  <input type="checkbox" name="featured" checked={!!form.featured} onChange={handleChange} />
                  <span>Featured — show in the Shop Top Brands strip and the Footer.</span>
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editing ? 'Save changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsManager;
