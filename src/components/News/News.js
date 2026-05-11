import React, { useEffect, useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { newsApi } from '../../api';
import './News.css';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await newsApi.list();
        if (!cancelled) setNewsItems(items);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;
  if (!newsItems.length) return null;

  const featuredNews = newsItems.find((item) => item.featured) || newsItems[0];
  const otherNews = newsItems.filter((item) => item._id !== featuredNews._id).slice(0, 2);

  return (
    <section className="news" id="blog">
      <div className="news-container">
        <h2 className="section-title">BREDL News</h2>

        <div className="news-grid">
          {featuredNews && (
            <a href={featuredNews.link || '#'} className="news-card featured">
              <div className="news-image-wrapper">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="news-image"
                />
              </div>
              <div className="news-content">
                <h3 className="news-title">
                  {featuredNews.title} <FiArrowRight />
                </h3>
                <span className="news-date">{featuredNews.date}</span>
              </div>
            </a>
          )}

          <div className="news-sidebar">
            {otherNews.map((item) => (
              <a key={item._id} href={item.link || '#'} className="news-card small">
                <div className="news-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="news-image"
                  />
                </div>
                <div className="news-content">
                  <h3 className="news-title">{item.title}</h3>
                  <span className="news-date">{item.date}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="news-cta">
          <a href="#all-news" className="btn-secondary">VIEW ALL</a>
        </div>
      </div>
    </section>
  );
};

export default News;
