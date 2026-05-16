import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../../api';
import './Departments.css';

const Departments = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await categoriesApi.list();
        if (cancelled) return;
        setCategories(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load categories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;
  if (error || categories.length === 0) return null;

  return (
    <section className="departments" id="departments">
      <div className="departments-container">
        <h2 className="section-title">DEPARTMENTS</h2>
        <div className="departments-grid">
          {categories.map((cat) => {
            const image = cat.coverImage || cat.image || '';
            const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
            const hasSubs = subs.length > 0;
            const key = cat._id || cat.slug;
            const isOpen = expanded === key;

            return (
              <div
                key={key}
                className={`department-card ${hasSubs ? 'has-subs' : ''} ${isOpen ? 'is-open' : ''}`}
                onMouseEnter={() => hasSubs && setExpanded(key)}
                onMouseLeave={() => hasSubs && setExpanded((cur) => (cur === key ? null : cur))}
              >
                <Link
                  to={`/shop/${cat.slug}`}
                  className="department-link"
                  aria-label={`Shop ${cat.name}`}
                >
                  <div className="department-image-wrapper">
                    {image ? (
                      <img
                        src={image}
                        alt={cat.name}
                        className="department-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="department-image department-image-placeholder" />
                    )}
                    <div className="department-overlay">
                      <h3 className="department-name">{cat.name}</h3>
                    </div>
                  </div>
                </Link>

                {hasSubs && (
                  <>
                    <button
                      type="button"
                      className="department-subs-toggle"
                      aria-label={`Show ${cat.name} sub-categories`}
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : key)}
                    >
                      +
                    </button>
                    <div className="department-subs" role="menu">
                      <ul className="department-subs-list">
                        {subs.map((sub) => (
                          <li key={sub.slug} role="none">
                            <Link
                              to={`/shop/${cat.slug}?subcategory=${sub.slug}`}
                              className="department-sub-link"
                              role="menuitem"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Departments;
