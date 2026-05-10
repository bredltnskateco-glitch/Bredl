import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import './News.css';

const News = () => {
  const newsItems = [
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
      title: 'Nike SB x BREDLCollaboration',
      date: 'December 5, 2025',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop',
      link: '#news-3',
      featured: false
    }
  ];

  const featuredNews = newsItems.find(item => item.featured);
  const otherNews = newsItems.filter(item => !item.featured);

  return (
    <section className="news" id="blog">
      <div className="news-container">
        <h2 className="section-title">BREDL News</h2>
        
        <div className="news-grid">
          {featuredNews && (
            <a href={featuredNews.link} className="news-card featured">
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
              <a key={item.id} href={item.link} className="news-card small">
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
