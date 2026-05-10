import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiStar } from 'react-icons/fi';
import './NewsManager.css';

const NewsManager = () => {
    const [news, setNews] = useState([
        {
            id: 1,
            title: 'Brayan Albarenga: Thunder Trucks',
            date: 'December 17, 2025',
            image: 'https://images.unsplash.com/photo-1564429238909-38f12a608ec4?w=800&h=500&fit=crop',
            link: '#news-1',
            featured: true
        },
        {
            id: 2,
            title: 'New Palace Drop This Friday',
            date: 'December 10, 2025',
            image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=600&h=400&fit=crop',
            link: '#news-2',
            featured: false
        },
        {
            id: 3,
            title: 'Nike SB x BREDL Collaboration',
            date: 'December 5, 2025',
            image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop',
            link: '#news-3',
            featured: false
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        image: '',
        link: '',
        featured: false
    });

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                date: item.date,
                image: item.image,
                link: item.link,
                featured: item.featured
            });
        } else {
            setEditingItem(null);
            const today = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            setFormData({
                title: '',
                date: today,
                image: '',
                link: '',
                featured: false
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
            title: formData.title,
            date: formData.date,
            image: formData.image,
            link: formData.link,
            featured: formData.featured
        };

        if (editingItem) {
            setNews(prev => prev.map(item =>
                item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
            ));
        } else {
            setNews(prev => [...prev, { ...itemData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this news article?')) {
            setNews(prev => prev.filter(item => item.id !== id));
        }
    };

    const toggleFeatured = (id) => {
        setNews(prev => prev.map(item => ({
            ...item,
            featured: item.id === id ? !item.featured : false
        })));
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="news-manager">
            {/* Header */}
            <div className="manager-header">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search news articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="add-btn" onClick={() => handleOpenModal()}>
                    <FiPlus />
                    Add News Article
                </button>
            </div>

            {/* News Table */}
            <div className="news-table-container">
                <table className="news-table">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Date</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNews.map(item => (
                            <tr key={item.id} className={item.featured ? 'featured-row' : ''}>
                                <td>
                                    <div className="article-cell">
                                        <img src={item.image} alt={item.title} className="article-thumb" />
                                        <div className="article-info">
                                            <span className="article-title">{item.title}</span>
                                            <a href={item.link} className="article-link" target="_blank" rel="noopener noreferrer">
                                                {item.link}
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td className="date-cell">{item.date}</td>
                                <td>
                                    <button
                                        className={`featured-btn ${item.featured ? 'active' : ''}`}
                                        onClick={() => toggleFeatured(item.id)}
                                        title={item.featured ? 'Remove from featured' : 'Set as featured'}
                                    >
                                        <FiStar />
                                    </button>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn edit" onClick={() => handleOpenModal(item)}>
                                            <FiEdit2 />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit News Article' : 'Add News Article'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Article Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="text"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        placeholder="January 20, 2026"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Link</label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        placeholder="#news-slug"
                                        required
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
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                    />
                                    <span>Mark as Featured Article</span>
                                </label>
                                <p className="checkbox-hint">Featured articles appear larger on the homepage</p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingItem ? 'Update' : 'Add'} Article
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsManager;
