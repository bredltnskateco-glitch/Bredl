import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiStar } from 'react-icons/fi';
import { newsApi } from '../../../../api';
import './NewsManager.css';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await newsApi.list();
            setNews(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load news');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        image: '',
        link: '',
        body: '',
        featured: false
    });

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || '',
                date: item.date || '',
                image: item.image || '',
                link: item.link || '',
                body: item.body || '',
                featured: !!item.featured
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
                body: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemData = {
            title: formData.title.trim(),
            date: formData.date.trim(),
            image: formData.image.trim(),
            link: formData.link.trim(),
            body: formData.body,
            featured: formData.featured
        };

        try {
            if (editingItem) {
                const updated = await newsApi.update(editingItem._id, itemData);
                setNews((prev) => prev.map((item) =>
                    item._id === editingItem._id ? { ...item, ...updated } : item,
                ));
            } else {
                const created = await newsApi.create(itemData);
                setNews((prev) => [created, ...prev]);
            }
            // If we set this one to featured, others will have been unfeatured server-side
            if (itemData.featured) {
                load();
            }
            handleCloseModal();
        } catch (err) {
            alert(err.message || 'Save failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news article?')) return;
        try {
            await newsApi.remove(id);
            setNews((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            alert(err.message || 'Delete failed');
        }
    };

    const toggleFeatured = async (item) => {
        try {
            const updated = await newsApi.update(item._id, { featured: !item.featured });
            // server unfeatures siblings; reload
            await load();
            void updated;
        } catch (err) {
            alert(err.message || 'Update failed');
        }
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

            {loading && <p>Loading news...</p>}
            {error && <p style={{ color: '#c00' }}>{error}</p>}

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
                        {filteredNews.map((item) => (
                            <tr key={item._id} className={item.featured ? 'featured-row' : ''}>
                                <td>
                                    <div className="article-cell">
                                        <img src={item.image} alt={item.title} className="article-thumb" />
                                        <div className="article-info">
                                            <span className="article-title">{item.title}</span>
                                            {item.link ? (
                                                <a href={item.link} className="article-link" target="_blank" rel="noopener noreferrer">
                                                    {item.link}
                                                </a>
                                            ) : (
                                                <span className="article-link muted">In-app article</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="date-cell">{item.date}</td>
                                <td>
                                    <button
                                        className={`featured-btn ${item.featured ? 'active' : ''}`}
                                        onClick={() => toggleFeatured(item)}
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
                                        <button className="action-btn delete" onClick={() => handleDelete(item._id)}>
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
                                    <label>Link (optional)</label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        placeholder="https://... or leave empty for in-app article"
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
                            <div className="form-group">
                                <label>Article body (optional)</label>
                                <textarea
                                    name="body"
                                    value={formData.body}
                                    onChange={handleInputChange}
                                    rows={5}
                                    placeholder="Shown in the in-app article modal when no external link is provided."
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
