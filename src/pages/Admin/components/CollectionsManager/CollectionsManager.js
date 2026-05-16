import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiLayers } from 'react-icons/fi';
import { collectionsApi } from '../../../../api';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './CollectionsManager.css';

const EMPTY = () => ({
  title: '',
  subtitle: '',
  image: '',
  href: '/shop',
  order: 0,
  active: true,
});

const CollectionsManager = () => {
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
      const data = await collectionsApi.adminList();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((c) =>
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY());
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      image: item.image || '',
      href: item.href || '/shop',
      order: item.order || 0,
      active: !!item.active,
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
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    try {
      if (editing) {
        const updated = await collectionsApi.update(editing._id, form);
        setItems((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
        toast.success('Collection updated');
      } else {
        const created = await collectionsApi.create(form);
        setItems((prev) => [created, ...prev]);
        toast.success('Collection created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this collection? It will disappear from the Shop page Featured Collections strip.')) return;
    try {
      await collectionsApi.remove(id);
      setItems((prev) => prev.filter((c) => c._id !== id));
      toast.success('Collection deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="collections-manager">
      <div className="manager-header">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={openCreate}>
          <FiPlus />
          Add Collection
        </button>
      </div>

      {loading && <p>Loading collections…</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={FiLayers}
          title={items.length === 0 ? 'No collections yet' : 'No collections match your search'}
          hint={
            items.length === 0
              ? 'Create a collection — it will appear in the Shop page Featured Collections strip with a cover image and a link.'
              : 'Try a different search term.'
          }
          actionLabel={items.length === 0 ? 'Add collection' : undefined}
          onAction={items.length === 0 ? openCreate : undefined}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="collections-grid">
          {filtered.map((item) => (
            <div key={item._id} className={`collection-card ${!item.active ? 'inactive' : ''}`}>
              <div className="collection-cover">
                {item.image ? <img src={item.image} alt={item.title} /> : <FiLayers />}
                {!item.active && <span className="collection-flag">Inactive</span>}
                <span className="collection-order">#{item.order ?? 0}</span>
              </div>
              <div className="collection-body">
                <h3>{item.title}</h3>
                <p className="collection-sub">{item.subtitle || '—'}</p>
                <p className="collection-href">{item.href}</p>
              </div>
              <div className="collection-actions">
                <button className="action-btn edit" aria-label="Edit collection" onClick={() => openEdit(item)}>
                  <FiEdit2 />
                </button>
                <button className="action-btn delete" aria-label="Delete collection" onClick={() => handleDelete(item._id)}>
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
              <h2>{editing ? 'Edit collection' : 'New collection'}</h2>
              <button className="admin-modal-close" aria-label="Close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Title *</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required autoFocus />
                </div>
                <div className="admin-form-group">
                  <label>Subtitle</label>
                  <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} maxLength={160} />
                </div>
                <div className="admin-form-group">
                  <label>Cover image URL</label>
                  <input type="url" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                  {form.image && (
                    <img src={form.image} alt="" className="collection-image-preview" />
                  )}
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Link target</label>
                    <input type="text" name="href" value={form.href} onChange={handleChange} placeholder="/shop or /shop/skate or ?brand=..." />
                  </div>
                  <div className="admin-form-group">
                    <label>Order</label>
                    <input type="number" name="order" value={form.order} onChange={handleChange} min="0" />
                  </div>
                </div>
                <label className="inline-checkbox">
                  <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} />
                  <span>Active — show on the Shop page</span>
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

export default CollectionsManager;
