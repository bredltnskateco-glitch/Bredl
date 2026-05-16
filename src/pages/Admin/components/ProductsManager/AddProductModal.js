import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiUpload, FiPlus, FiTrash2, FiInfo, FiTag } from 'react-icons/fi';
import { categoriesApi } from '../../../../api';
import {
  SPEC_FIELDS_BY_SUBCAT,
  SPEC_OPTIONS,
  SPEC_LABELS,
} from '../../../../constants/subcategorySpecs';
import './AddProductModal.css';

const APPAREL_CATEGORIES = new Set(['streetwear', 'snowboard', 'accessories']);
const SHOE_CATEGORIES = new Set(['shoes']);

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];

const BRANDS = [
  'Bredl', 'Nike SB', 'Adidas', 'Vans', 'Carhartt WIP', 'Palace', 'Supreme',
  'Thrasher', 'Santa Cruz', 'Independent', 'Spitfire', 'Bones', 'Burton',
  'The North Face', 'Patagonia', 'Element', 'Baker', 'Girl', 'Real', 'Polar Skate',
  'Zero', 'Hockey', 'Creature', 'Toy Machine', 'Channel Islands', 'Other',
];

const emptyForm = () => ({
  name: '',
  category: '',
  subcategory: '',
  price: '',
  salePrice: '',
  stock: '',
  description: '',
  image: '',
  images: [],
  sizes: [],
  shoeSize: [],
  colors: [],
  brand: 'Bredl',
  sku: '',
  tags: [],
  isFeatured: false,
  isNew: false,
  isPromo: false,
  // Spec fields are merged in dynamically based on selected subcategory.
  deckWidth: '',
  concave: '',
  material: '',
  truckSize: '',
  axleWidth: '',
  wheelSize: '',
  durometer: '',
  wheelShape: '',
  boardLength: '',
  boardVolume: '',
  finSetup: '',
  flex: '',
});

const AddProductModal = ({ isOpen, onClose, onSave, editingProduct = null }) => {
  const [formData, setFormData] = useState(emptyForm());
  const [categories, setCategories] = useState([]);
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  // Load categories once when the modal first opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await categoriesApi.list();
        if (!cancelled) setCategories(data || []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      setFormData({
        ...emptyForm(),
        ...editingProduct,
        price: editingProduct.price?.toString() || '',
        salePrice: editingProduct.salePrice?.toString() || '',
        stock: editingProduct.stock?.toString() || '',
        sizes: editingProduct.sizes || [],
        shoeSize: editingProduct.shoeSize || [],
        colors: editingProduct.colors || [],
        tags: editingProduct.tags || [],
        images: editingProduct.images || [],
        isFeatured: !!editingProduct.isFeatured,
        isNew: !!editingProduct.isNew,
        isPromo: !!editingProduct.isPromo,
      });
    } else {
      setFormData(emptyForm());
    }
    setErrors({});
    setActiveTab('basic');
    setImageUrlInput('');
  }, [editingProduct, isOpen]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === formData.category) || null,
    [categories, formData.category],
  );

  const availableSubcategories = selectedCategory?.subcategories || [];

  const specFields = useMemo(
    () => SPEC_FIELDS_BY_SUBCAT[formData.subcategory] || [],
    [formData.subcategory],
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };
      // If the category changes, reset subcategory + spec fields so we don't
      // carry stale values from another category.
      if (name === 'category' && value !== prev.category) {
        next.subcategory = '';
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleShoeSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      shoeSize: prev.shoeSize.includes(size)
        ? prev.shoeSize.filter((s) => s !== size)
        : [...prev.shoeSize, size],
    }));
  };

  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, newColor] }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // Add one or more image URLs. Supports newline- or comma-separated paste
  // so admins can drop a list from their cloud-storage browser at once.
  const handleAddImage = () => {
    const raw = imageUrlInput;
    if (!raw || !raw.trim()) return;
    const parts = raw.split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setFormData((prev) => {
      const next = [...prev.images];
      parts.forEach((u) => { if (!next.includes(u)) next.push(u); });
      return { ...prev, images: next };
    });
    setImageUrlInput('');
  };

  const handleImageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || parseInt(formData.stock, 10) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveTab('basic');
      return;
    }
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock, 10),
      image: formData.image
        || formData.images[0]
        || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
    };
    onSave(productData, editingProduct?._id || editingProduct?.id);
    setFormData(emptyForm());
    onClose();
  };

  const renderSpecInput = (field) => {
    const options = SPEC_OPTIONS[field];
    const label = SPEC_LABELS[field] || field;
    if (options && options.length > 0) {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <select name={field} value={formData[field] || ''} onChange={handleInputChange}>
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <input
          type="text"
          name={field}
          value={formData[field] || ''}
          onChange={handleInputChange}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="add-product-modal-overlay" onClick={onClose}>
      <div className="add-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
          <button
            className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveTab('variants')}
          >
            Variants
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={errors.category ? 'error' : ''}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                  </div>

                  {availableSubcategories.length > 0 && (
                    <div className="form-group">
                      <label>Sub-Category</label>
                      <select
                        name="subcategory"
                        value={formData.subcategory || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Sub-Category</option>
                        {availableSubcategories.map((s) => (
                          <option key={s.slug} value={s.slug}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Brand</label>
                    <select name="brand" value={formData.brand} onChange={handleInputChange}>
                      {BRANDS.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (TND) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={errors.price ? 'error' : ''}
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                  </div>

                  <div className="form-group">
                    <label>Sale Price (TND)</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className={errors.stock ? 'error' : ''}
                    />
                    {errors.stock && <span className="error-message">{errors.stock}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Product SKU (e.g., SKU-12345)"
                  />
                </div>

                <div className="form-group">
                  <label>Visibility</label>
                  <div className="flag-row">
                    <label className="flag-checkbox">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={!!formData.isFeatured}
                        onChange={handleInputChange}
                      />
                      <span>Featured on home page</span>
                    </label>
                    <label className="flag-checkbox">
                      <input
                        type="checkbox"
                        name="isNew"
                        checked={!!formData.isNew}
                        onChange={handleInputChange}
                      />
                      <span>Mark as New</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    className={`promo-toggle-btn ${formData.isPromo ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, isPromo: !prev.isPromo }))}
                    aria-pressed={!!formData.isPromo}
                  >
                    <FiTag />
                    <span>{formData.isPromo ? 'In Promo — highlighted in shop' : 'Highlight as Promo in shop'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    rows="6"
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    <div className="tags-list">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)}>
                            <FiX />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="add-tag-input">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <button type="button" onClick={handleAddTag}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="tab-content">
                <div className="form-group">
                  <label>Main Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {formData.image && (
                  <div className="image-preview main-preview">
                    <img src={formData.image} alt="Main preview" />
                  </div>
                )}

                <div className="form-group">
                  <label>Additional Images</label>
                  <small className="form-hint">
                    Paste one or more cloud-storage image URLs. Separate multiple with commas or new lines.
                  </small>
                  <div className="add-image-row">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={handleImageInputKeyDown}
                      placeholder="https://cdn.example.com/photo.jpg"
                    />
                    <button type="button" className="add-image-btn-inline" onClick={handleAddImage}>
                      <FiUpload />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="additional-images">
                    {formData.images.map((img, index) => (
                      <div key={index} className="additional-image">
                        <img src={img} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="tab-content">
                <p className="variants-optional-note">
                  <FiInfo /> All fields on this tab are optional — fill in only what applies to this product.
                </p>

                {APPAREL_CATEGORIES.has(formData.category) && (
                  <div className="form-group">
                    <label>Available Clothing Sizes <span className="optional-tag">(optional)</span></label>
                    <div className="sizes-grid">
                      {CLOTHING_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`size-btn ${formData.sizes.includes(size) ? 'selected' : ''}`}
                          onClick={() => handleSizeToggle(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {SHOE_CATEGORIES.has(formData.category) && (
                  <div className="form-group">
                    <label>Available Shoe Sizes (EU) <span className="optional-tag">(optional)</span></label>
                    <div className="sizes-grid shoe-sizes">
                      {SHOE_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`size-btn ${formData.shoeSize.includes(size) ? 'selected' : ''}`}
                          onClick={() => handleShoeSizeToggle(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {specFields.length > 0 && (
                  <div className="category-specs">
                    <h4><FiInfo /> {selectedCategory?.name} — {availableSubcategories.find((s) => s.slug === formData.subcategory)?.name} Specs <span className="optional-tag">(optional)</span></h4>
                    <div className="specs-grid">
                      {specFields.map(renderSpecInput)}
                    </div>
                  </div>
                )}

                {formData.subcategory === '' && formData.category && availableSubcategories.length > 0 && (
                  <p className="form-hint">Select a sub-category on the Basic Info tab to expose its spec fields.</p>
                )}

                <div className="form-group">
                  <label>Colors <span className="optional-tag">(optional)</span></label>
                  <div className="colors-input">
                    <div className="colors-list">
                      {formData.colors.map((color) => (
                        <span key={color} className="color-tag">
                          {color}
                          <button type="button" onClick={() => handleRemoveColor(color)}>
                            <FiX />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="add-color-input">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add a color (e.g., Black, White)"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                      />
                      <button type="button" onClick={handleAddColor}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
