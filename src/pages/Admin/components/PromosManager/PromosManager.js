import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTag, FiSpeaker,
} from 'react-icons/fi';
import { promosApi, settingsApi } from '../../../../api';
import { useSettings } from '../../../../context/SettingsContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './PromosManager.css';

const EMPTY = () => ({
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: '',
  minOrderTotal: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
});

const formatExpiry = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // ISO date for the <input type="date">
  return d.toISOString().slice(0, 10);
};

const summarize = (promo) => {
  if (!promo) return '';
  if (promo.discountType === 'percent') return `${promo.discountValue}% off`;
  return `${formatCurrency(promo.discountValue)} off`;
};

const PromosManager = () => {
  const { refresh: refreshSettings } = useSettings();
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
      const data = await promosApi.list();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load promos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      (p.code || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q),
    );
  }, [items, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY());
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setForm({
      code: promo.code || '',
      description: promo.description || '',
      discountType: promo.discountType || 'percent',
      discountValue: promo.discountValue != null ? String(promo.discountValue) : '',
      minOrderTotal: promo.minOrderTotal != null ? String(promo.minOrderTotal) : '',
      maxUses: promo.maxUses != null ? String(promo.maxUses) : '',
      expiresAt: formatExpiry(promo.expiresAt),
      isActive: !!promo.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (form.discountValue === '' || Number(form.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0'); return;
    }
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) {
      toast.error('Percent discount cannot exceed 100'); return;
    }
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderTotal: form.minOrderTotal !== '' ? Number(form.minOrderTotal) : 0,
      maxUses: form.maxUses !== '' ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      isActive: !!form.isActive,
    };
    try {
      if (editing) {
        const updated = await promosApi.update(editing._id, payload);
        setItems((prev) => prev.map((p) => (p._id === editing._id ? updated : p)));
        toast.success('Promo updated');
      } else {
        const created = await promosApi.create(payload);
        setItems((prev) => [created, ...prev]);
        toast.success('Promo created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code? Customers can no longer redeem it after this.')) return;
    try {
      await promosApi.remove(id);
      setItems((prev) => prev.filter((p) => p._id !== id));
      toast.success('Promo deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // One-click "promote" — copies the code into the site-wide announcement bar.
  const handlePromote = async (promo) => {
    if (!window.confirm(`Show "${promo.code}" in the site-wide announcement bar?`)) return;
    try {
      const text = `Use code ${promo.code} at checkout — ${summarize(promo)}.`;
      await settingsApi.save({ announcement: { enabled: true, text, href: '/shop' } });
      await refreshSettings();
      toast.success('Promo featured in the announcement bar');
    } catch (err) {
      toast.error(err.message || 'Could not promote');
    }
  };

  const statusOf = (promo) => {
    if (!promo.isActive) return { text: 'Inactive', cls: 'status-cancelled' };
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() <= Date.now()) {
      return { text: 'Expired', cls: 'status-cancelled' };
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return { text: 'Used up', cls: 'status-cancelled' };
    }
    return { text: 'Active', cls: 'status-completed' };
  };

  return (
    <div className="promos-manager">
      <div className="manager-header">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search promos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={openCreate}>
          <FiPlus />
          Add Promo
        </button>
      </div>

      {loading && <p>Loading promos…</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={FiTag}
          title={items.length === 0 ? 'No promo codes yet' : 'No promos match your search'}
          hint={
            items.length === 0
              ? 'Create a promo code — shoppers will be able to apply it at checkout, and you can promote it on the storefront announcement bar with one click.'
              : 'Try a different search term.'
          }
          actionLabel={items.length === 0 ? 'Create promo' : undefined}
          onAction={items.length === 0 ? openCreate : undefined}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="admin-data-table promos-table-container">
          <table className="promos-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = statusOf(p);
                return (
                  <tr key={p._id}>
                    <td data-label="Code" className="promo-code-cell">
                      <strong>{p.code}</strong>
                      {p.description && <span className="promo-desc">{p.description}</span>}
                    </td>
                    <td data-label="Discount">{summarize(p)}</td>
                    <td data-label="Min Order">{p.minOrderTotal ? formatCurrency(p.minOrderTotal) : '—'}</td>
                    <td data-label="Used">{p.usedCount || 0}{p.maxUses != null ? ` / ${p.maxUses}` : ''}</td>
                    <td data-label="Expires">{p.expiresAt ? formatDate(p.expiresAt) : 'No expiry'}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${status.cls}`}>{status.text}</span>
                    </td>
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn promote"
                          title="Promote on announcement bar"
                          aria-label="Promote on announcement bar"
                          onClick={() => handlePromote(p)}
                        >
                          <FiSpeaker />
                        </button>
                        <button className="action-btn edit" aria-label="Edit promo" onClick={() => openEdit(p)}>
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" aria-label="Delete promo" onClick={() => handleDelete(p._id)}>
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

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editing ? 'Edit promo' : 'New promo'}</h2>
              <button className="admin-modal-close" aria-label="Close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="SUMMER10"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Type *</label>
                    <select name="discountType" value={form.discountType} onChange={handleChange}>
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Value *</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={form.discountValue}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Min order total</label>
                    <input
                      type="number"
                      name="minOrderTotal"
                      value={form.minOrderTotal}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Max uses</label>
                    <input
                      type="number"
                      name="maxUses"
                      value={form.maxUses}
                      onChange={handleChange}
                      min="0"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Expires on</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={form.expiresAt}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description (shown internally)</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Summer launch — 10% sitewide"
                  />
                </div>

                <label className="promo-active-toggle">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={!!form.isActive}
                    onChange={handleChange}
                  />
                  <span>Active — customers can redeem this code at checkout.</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editing ? 'Save changes' : 'Create promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromosManager;
