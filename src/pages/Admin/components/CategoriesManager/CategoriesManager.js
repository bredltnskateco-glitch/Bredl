import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBox, FiTag } from 'react-icons/fi';
import { categoriesApi } from '../../../../api';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './CategoriesManager.css';

const slugify = (s) => String(s || '').toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '');

const emptyForm = () => ({
  name: '',
  description: '',
  image: '',
  kind: 'category',
  parentId: '',
});

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null); // {parentId, originalSlug}
  const [formData, setFormData] = useState(emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      categoriesApi.invalidate?.();
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

  const handleKindChange = (kind) => {
    setFormData((prev) => ({ ...prev, kind, parentId: kind === 'subcategory' ? prev.parentId : '' }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setEditingSubcategory(null);
    setFormData(emptyForm());
  };

  const openCreate = () => {
    setEditingCategory(null);
    setEditingSubcategory(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditingSubcategory(null);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      kind: 'category',
      parentId: '',
    });
    setShowModal(true);
  };

  const handleEditSubcategory = (parent, sub) => {
    setEditingCategory(null);
    setEditingSubcategory({ parentId: parent._id, originalSlug: sub.slug });
    setFormData({
      name: sub.name,
      description: '',
      image: '',
      kind: 'subcategory',
      parentId: parent._id,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (formData.kind === 'category') {
        if (editingCategory) {
          const updated = await categoriesApi.update(editingCategory._id, {
            name: formData.name,
            description: formData.description,
            image: formData.image,
          });
          setCategories((prev) =>
            prev.map((c) => (c._id === editingCategory._id ? { ...c, ...updated } : c)),
          );
          toast.success('Category updated');
        } else {
          const created = await categoriesApi.create({
            name: formData.name,
            description: formData.description,
            image: formData.image,
          });
          setCategories((prev) => [...prev, { ...created, productCount: 0 }]);
          toast.success('Category created');
        }
      } else {
        // Sub-category branch — mutate the parent's subcategories array.
        if (!formData.parentId) {
          toast.error('Please pick a parent category for the sub-category.');
          return;
        }
        const parent = categories.find((c) => c._id === formData.parentId);
        if (!parent) {
          toast.error('Parent category not found.');
          return;
        }
        const newSlug = slugify(formData.name);
        const existing = parent.subcategories || [];
        let nextSubs;
        if (editingSubcategory) {
          nextSubs = existing.map((s) =>
            s.slug === editingSubcategory.originalSlug
              ? { slug: newSlug, name: formData.name }
              : s);
        } else {
          if (existing.some((s) => s.slug === newSlug)) {
            toast.error('A sub-category with that name already exists in this category.');
            return;
          }
          nextSubs = [...existing, { slug: newSlug, name: formData.name }];
        }
        const updated = await categoriesApi.update(parent._id, { subcategories: nextSubs });
        setCategories((prev) =>
          prev.map((c) => (c._id === parent._id ? { ...c, ...updated } : c)),
        );
        toast.success(editingSubcategory ? 'Sub-category updated' : 'Sub-category created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and all its sub-categories? Products in this category will become uncategorized.')) return;
    try {
      await categoriesApi.remove(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleDeleteSubcategory = async (parent, sub) => {
    if (!window.confirm(`Remove sub-category "${sub.name}"? Products that reference it will no longer match this sub-category filter.`)) return;
    try {
      const nextSubs = (parent.subcategories || []).filter((s) => s.slug !== sub.slug);
      const updated = await categoriesApi.update(parent._id, { subcategories: nextSubs });
      setCategories((prev) =>
        prev.map((c) => (c._id === parent._id ? { ...c, ...updated } : c)),
      );
      toast.success('Sub-category removed');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="categories-manager">
      <div className="categories-header">
        <div className="header-info">
          <h2>Product Categories</h2>
          <p>Manage your store's categories and sub-categories</p>
        </div>
        <button className="add-btn" onClick={openCreate}>
          <FiPlus />
          Add Category
        </button>
      </div>

      {loading && <p>Loading categories...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={FiTag}
          title="No categories yet"
          hint="Add your first category — it powers the storefront navbar, shop filters, and the home page departments grid."
          actionLabel="Add category"
          onAction={openCreate}
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category._id} className="category-card">
              <div className="category-icon">
                {category.coverImage || category.image ? (
                  <img
                    src={category.coverImage || category.image}
                    alt={category.name}
                    className="category-thumb"
                  />
                ) : (
                  <FiBox />
                )}
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <p className="category-slug">/{category.slug}</p>
                <p className="category-desc">{category.description}</p>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="subcategory-chips">
                    {category.subcategories.map((sub) => (
                      <span key={sub.slug} className="subcategory-chip">
                        <span className="subcategory-chip-name">{sub.name}</span>
                        <button
                          type="button"
                          className="subcategory-chip-edit"
                          aria-label={`Edit ${sub.name}`}
                          onClick={() => handleEditSubcategory(category, sub)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          type="button"
                          className="subcategory-chip-delete"
                          aria-label={`Delete ${sub.name}`}
                          onClick={() => handleDeleteSubcategory(category, sub)}
                        >
                          <FiX />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="category-count">
                <span className="count">{category.productCount || 0}</span>
                <span className="label">Products</span>
              </div>
              <div className="category-actions">
                <button className="action-btn edit" onClick={() => handleEditCategory(category)}>
                  <FiEdit2 />
                </button>
                <button className="action-btn delete" onClick={() => handleDeleteCategory(category._id)}>
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
              <h2>
                {editingCategory && 'Edit Category'}
                {editingSubcategory && 'Edit Sub-Category'}
                {!editingCategory && !editingSubcategory && (formData.kind === 'category' ? 'Add Category' : 'Add Sub-Category')}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* Kind toggle only when creating fresh (not when editing) */}
              {!editingCategory && !editingSubcategory && (
                <div className="form-group">
                  <label>Type</label>
                  <div className="kind-toggle">
                    <button
                      type="button"
                      className={`kind-btn ${formData.kind === 'category' ? 'active' : ''}`}
                      onClick={() => handleKindChange('category')}
                    >
                      Category
                    </button>
                    <button
                      type="button"
                      className={`kind-btn ${formData.kind === 'subcategory' ? 'active' : ''}`}
                      onClick={() => handleKindChange('subcategory')}
                    >
                      Sub-Category
                    </button>
                  </div>
                </div>
              )}

              {formData.kind === 'subcategory' && (
                <div className="form-group">
                  <label>Parent category *</label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    disabled={!!editingSubcategory}
                  >
                    <option value="">Select a parent category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{formData.kind === 'subcategory' ? 'Sub-Category Name *' : 'Category Name *'}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={formData.kind === 'subcategory' ? 'e.g. Wheels' : 'e.g. Skateboard'}
                />
              </div>

              {formData.kind === 'category' && (
                <>
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

                  <div className="form-group">
                    <label>Cover image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Category preview"
                        className="category-image-preview"
                      />
                    )}
                    <small className="form-hint">
                      Leave blank to auto-fall-back to the first product image of this category.
                    </small>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                {(editingCategory || editingSubcategory) ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
