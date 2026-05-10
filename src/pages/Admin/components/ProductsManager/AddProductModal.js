import React, { useState, useEffect } from 'react';
import { FiX, FiImage, FiUpload, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import './AddProductModal.css';

const AddProductModal = ({ isOpen, onClose, onSave, editingProduct = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Streetwear',
    price: '',
    salePrice: '',
    stock: '',
    description: '',
    image: '',
    images: [],
    sizes: [],
    colors: [],
    brand: '',
    sku: '',
    tags: [],
    // Skateboard specific fields
    deckWidth: '',
    deckLength: '',
    wheelbase: '',
    concave: '',
    material: '',
    // Shoe specific fields
    shoeSize: [],
    // Surf specific fields
    boardLength: '',
    boardVolume: '',
    finSetup: ''
  });

  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  const categories = ['Streetwear', 'Shoes', 'Accessories', 'Skate', 'Surf', 'Snowboard'];
  
  // Clothing sizes
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  // Shoe sizes (EU sizing)
  const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];
  
  // Skateboard deck widths
  const deckWidths = ['7.5"', '7.75"', '8.0"', '8.125"', '8.25"', '8.375"', '8.5"', '8.625"', '8.75"', '9.0"', '9.5"', '10.0"'];
  
  // Skateboard concave types
  const concaveTypes = ['Low', 'Medium', 'High', 'Mellow', 'Steep'];
  
  // Skateboard materials
  const deckMaterials = ['7-Ply Maple', 'Canadian Maple', 'Bamboo', 'Carbon Fiber Reinforced', 'Epoxy Resin', 'Fibreglass Reinforced'];
  
  // Surf fin setups
  const finSetups = ['Thruster (3 fins)', 'Quad (4 fins)', 'Twin Fin', 'Single Fin', '5 Fin (Convertible)'];
  
  const brands = ['Nike SB', 'Adidas', 'Vans', 'Carhartt WIP', 'Palace', 'Supreme', 'Thrasher', 'Santa Cruz', 'Independent', 'Spitfire', 'Burton', 'The North Face', 'Patagonia', 'Element', 'Baker', 'Girl', 'Real', 'Polar Skate', 'Zero', 'Hockey Skateboards', 'Creature', 'Toy Machine', 'Channel Islands', 'Other'];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || 'Streetwear',
        price: editingProduct.price?.toString() || '',
        salePrice: editingProduct.salePrice?.toString() || '',
        stock: editingProduct.stock?.toString() || '',
        description: editingProduct.description || '',
        image: editingProduct.image || '',
        images: editingProduct.images || [],
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || [],
        brand: editingProduct.brand || '',
        sku: editingProduct.sku || '',
        tags: editingProduct.tags || [],
        deckWidth: editingProduct.deckWidth || '',
        deckLength: editingProduct.deckLength || '',
        wheelbase: editingProduct.wheelbase || '',
        concave: editingProduct.concave || '',
        material: editingProduct.material || '',
        shoeSize: editingProduct.shoeSize || [],
        boardLength: editingProduct.boardLength || '',
        boardVolume: editingProduct.boardVolume || '',
        finSetup: editingProduct.finSetup || ''
      });
    } else {
      resetForm();
    }
  }, [editingProduct, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Streetwear',
      price: '',
      salePrice: '',
      stock: '',
      description: '',
      image: '',
      images: [],
      sizes: [],
      colors: [],
      brand: '',
      sku: '',
      tags: [],
      deckWidth: '',
      deckLength: '',
      wheelbase: '',
      concave: '',
      material: '',
      shoeSize: [],
      boardLength: '',
      boardVolume: '',
      finSetup: ''
    });
    setErrors({});
    setActiveTab('basic');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

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
      stock: parseInt(formData.stock),
      status: parseInt(formData.stock) > 20 ? 'Active' : parseInt(formData.stock) > 0 ? 'Low Stock' : 'Out of Stock',
      image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
    };

    onSave(productData, editingProduct?.id);
    resetForm();
    onClose();
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
            {/* Basic Info Tab */}
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
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <select name="brand" value={formData.brand} onChange={handleInputChange}>
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
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
              </div>
            )}

            {/* Details Tab */}
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
                      {formData.tags.map(tag => (
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <button type="button" onClick={handleAddTag}>
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
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
                    <button 
                      type="button" 
                      className="add-image-btn"
                      onClick={handleAddImage}
                    >
                      <FiUpload />
                      <span>Add Image</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === 'variants' && (
              <div className="tab-content">
                {/* Clothing Sizes - for Streetwear, Snowboard apparel */}
                {(formData.category === 'Streetwear' || formData.category === 'Snowboard') && (
                  <div className="form-group">
                    <label>Available Clothing Sizes</label>
                    <div className="sizes-grid">
                      {clothingSizes.map(size => (
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

                {/* Shoe Sizes - for Shoes category */}
                {formData.category === 'Shoes' && (
                  <div className="form-group">
                    <label>Available Shoe Sizes (EU)</label>
                    <div className="sizes-grid shoe-sizes">
                      {shoeSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          className={`size-btn ${formData.shoeSize.includes(size) ? 'selected' : ''}`}
                          onClick={() => {
                            const newSizes = formData.shoeSize.includes(size)
                              ? formData.shoeSize.filter(s => s !== size)
                              : [...formData.shoeSize, size];
                            setFormData(prev => ({ ...prev, shoeSize: newSizes }));
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skateboard Specifications */}
                {formData.category === 'Skate' && (
                  <div className="category-specs">
                    <h4><FiInfo /> Skateboard Specifications</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Deck Width</label>
                        <select 
                          name="deckWidth" 
                          value={formData.deckWidth} 
                          onChange={handleInputChange}
                        >
                          <option value="">Select Width</option>
                          {deckWidths.map(width => (
                            <option key={width} value={width}>{width}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Deck Length</label>
                        <input
                          type="text"
                          name="deckLength"
                          value={formData.deckLength}
                          onChange={handleInputChange}
                          placeholder='e.g., 31.5"'
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Wheelbase</label>
                        <input
                          type="text"
                          name="wheelbase"
                          value={formData.wheelbase}
                          onChange={handleInputChange}
                          placeholder='e.g., 14.25"'
                        />
                      </div>

                      <div className="form-group">
                        <label>Concave</label>
                        <select 
                          name="concave" 
                          value={formData.concave} 
                          onChange={handleInputChange}
                        >
                          <option value="">Select Concave</option>
                          {concaveTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Material</label>
                      <select 
                        name="material" 
                        value={formData.material} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select Material</option>
                        {deckMaterials.map(mat => (
                          <option key={mat} value={mat}>{mat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Surf Specifications */}
                {formData.category === 'Surf' && (
                  <div className="category-specs">
                    <h4><FiInfo /> Surfboard Specifications</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Board Length</label>
                        <input
                          type="text"
                          name="boardLength"
                          value={formData.boardLength}
                          onChange={handleInputChange}
                          placeholder="e.g., 6'2"
                        />
                      </div>

                      <div className="form-group">
                        <label>Volume (Liters)</label>
                        <input
                          type="text"
                          name="boardVolume"
                          value={formData.boardVolume}
                          onChange={handleInputChange}
                          placeholder="e.g., 32.5L"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Fin Setup</label>
                      <select 
                        name="finSetup" 
                        value={formData.finSetup} 
                        onChange={handleInputChange}
                      >
                        <option value="">Select Fin Setup</option>
                        {finSetups.map(setup => (
                          <option key={setup} value={setup}>{setup}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Accessories - basic sizes */}
                {formData.category === 'Accessories' && (
                  <div className="form-group">
                    <label>Available Sizes (if applicable)</label>
                    <div className="sizes-grid">
                      {clothingSizes.map(size => (
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

                {/* Colors - available for all categories */}
                <div className="form-group">
                  <label>Colors</label>
                  <div className="colors-input">
                    <div className="colors-list">
                      {formData.colors.map(color => (
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
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
