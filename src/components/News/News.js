import React, { useEffect, useState, useMemo } from 'react';
import { FiArrowRight, FiX, FiCalendar } from 'react-icons/fi';
import { newsApi } from '../../api';
import './News.css';

const PREVIEW_SIDEBAR_COUNT = 2;
const FALLBACK_IMAGE = '/DSC00503.JPG';

const getNewsImage = (item) => item?.image || FALLBACK_IMAGE;

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
  event.currentTarget.src = FALLBACK_IMAGE;
};

const formatDisplayDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return String(value);
};

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await newsApi.list();
        if (!cancelled) setNewsItems(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { featuredNews, sidebarNews, hasMore } = useMemo(() => {
    if (!newsItems.length) {
      return { featuredNews: null, sidebarNews: [], hasMore: false };
    }
    const featured = newsItems.find((item) => item.featured) || newsItems[0];
    const others = newsItems.filter((item) => item._id !== featured._id);
    return {
      featuredNews: featured,
      sidebarNews: others.slice(0, PREVIEW_SIDEBAR_COUNT),
      hasMore: others.length > PREVIEW_SIDEBAR_COUNT || newsItems.length > 1 + PREVIEW_SIDEBAR_COUNT,
    };
  }, [newsItems]);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

  const handleCardClick = (e, item) => {
    if (item.link && /^https?:\/\//i.test(item.link)) {
      return;
    }
    e.preventDefault();
    setSelected(item);
  };

  if (loading) return null;
  if (!newsItems.length) return null;

  return (
    <section className="news" id="blog">
      <div className="news-container">
        <h2 className="section-title">BREDL News</h2>

        <div className="news-grid">
          {featuredNews && (
            <a
              href={featuredNews.link || '#'}
              className="news-card featured"
              onClick={(e) => handleCardClick(e, featuredNews)}
              target={featuredNews.link && /^https?:\/\//i.test(featuredNews.link) ? '_blank' : undefined}
              rel={featuredNews.link && /^https?:\/\//i.test(featuredNews.link) ? 'noopener noreferrer' : undefined}
            >
              <div className="news-image-wrapper">
                <img
                  src={getNewsImage(featuredNews)}
                  alt={featuredNews.title}
                  className="news-image"
                  loading="lazy"
                  onError={handleImageError}
                />
                <span className="news-card-badge">Featured</span>
              </div>
              <div className="news-content">
                <h3 className="news-title">
                  <span>{featuredNews.title}</span>
                  <FiArrowRight aria-hidden="true" />
                </h3>
                <span className="news-date">
                  <FiCalendar aria-hidden="true" /> {formatDisplayDate(featuredNews.date)}
                </span>
              </div>
            </a>
          )}

          <div className="news-sidebar">
            {sidebarNews.map((item) => (
              <a
                key={item._id}
                href={item.link || '#'}
                className="news-card small"
                onClick={(e) => handleCardClick(e, item)}
                target={item.link && /^https?:\/\//i.test(item.link) ? '_blank' : undefined}
                rel={item.link && /^https?:\/\//i.test(item.link) ? 'noopener noreferrer' : undefined}
              >
                <div className="news-image-wrapper">
                  <img
                    src={getNewsImage(item)}
                    alt={item.title}
                    className="news-image"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>
                <div className="news-content">
                  <h3 className="news-title">
                    <span>{item.title}</span>
                  </h3>
                  <span className="news-date">
                    <FiCalendar aria-hidden="true" /> {formatDisplayDate(item.date)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {hasMore && (
          <div className="news-cta">
            <button type="button" className="btn-secondary" onClick={() => setShowAll(true)}>
              VIEW ALL
            </button>
          </div>
        )}
      </div>

      {showAll && (
        <div
          className="news-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="All news articles"
          onClick={() => setShowAll(false)}
        >
          <div className="news-modal" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <h3>All News</h3>
              <button
                type="button"
                className="news-modal-close"
                onClick={() => setShowAll(false)}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
            <div className="news-modal-grid">
              {newsItems.map((item) => (
                <a
                  key={item._id}
                  href={item.link || '#'}
                  className="news-card small"
                  onClick={(e) => {
                    setShowAll(false);
                    handleCardClick(e, item);
                  }}
                  target={item.link && /^https?:\/\//i.test(item.link) ? '_blank' : undefined}
                  rel={item.link && /^https?:\/\//i.test(item.link) ? 'noopener noreferrer' : undefined}
                >
                  <div className="news-image-wrapper">
                    <img
                      src={getNewsImage(item)}
                      alt={item.title}
                      className="news-image"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    {item.featured && <span className="news-card-badge">Featured</span>}
                  </div>
                  <div className="news-content">
                    <h3 className="news-title">
                      <span>{item.title}</span>
                    </h3>
                    <span className="news-date">
                      <FiCalendar aria-hidden="true" /> {formatDisplayDate(item.date)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="news-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div className="news-modal article" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="news-modal-close floating"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <FiX />
            </button>
            <div className="news-article-image">
              <img src={getNewsImage(selected)} alt={selected.title} onError={handleImageError} />
            </div>
            <div className="news-article-body">
              <span className="news-date">
                <FiCalendar aria-hidden="true" /> {formatDisplayDate(selected.date)}
              </span>
              <h3 className="news-article-title">{selected.title}</h3>
              {selected.body ? (
                <p className="news-article-text">{selected.body}</p>
              ) : (
                <p className="news-article-text muted">
                  More about this story coming soon. Stay tuned for updates.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default News;
