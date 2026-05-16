import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useSettings } from '../../context/SettingsContext';
import './AnnouncementBar.css';

// Dismissed-bar key changes with the message so editing the announcement in
// admin re-shows it to users who had previously closed the old one.
const dismissKey = (text) => `announcementDismissed:${text}`;

const AnnouncementBar = () => {
  const { settings } = useSettings();
  const announcement = settings?.announcement;
  const text = (announcement?.text || '').trim();

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!text) return;
    try {
      setDismissed(sessionStorage.getItem(dismissKey(text)) === '1');
    } catch (_err) {
      setDismissed(false);
    }
  }, [text]);

  if (!announcement || !announcement.enabled || !text || dismissed) return null;

  const href = (announcement.href || '').trim();
  const isExternal = /^https?:\/\//i.test(href);
  const internalHref = href.startsWith('/') ? href : `/${href.replace(/^\/+/, '')}`;

  const inner = <p>{text}</p>;

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(dismissKey(text), '1');
    } catch (_err) {
      // ignore — storage may be disabled, dismiss will still hide for this render
    }
    setDismissed(true);
  };

  return (
    <div className="announcement-bar" role="status" aria-live="polite">
      {href && isExternal ? (
        <a
          href={href}
          className="announcement-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      ) : href ? (
        <Link to={internalHref} className="announcement-link">
          {inner}
        </Link>
      ) : inner}
      <button
        type="button"
        className="announcement-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
