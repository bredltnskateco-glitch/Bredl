import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '../api';

// Sensible defaults so storefront layout never flashes empty during initial
// fetch or if the API is unreachable. Mirrors server/models/Settings.js defaults.
export const DEFAULT_SETTINGS = {
  storeName: 'BREDL',
  storeTagline: 'Your local skate shop in Barcelona since 2010. Premium skate gear, shoes, and clothing from the best brands.',
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  currency: 'TND',
  socials: {
    instagram: 'https://www.instagram.com',
    facebook: 'https://www.facebook.com',
    twitter: 'https://twitter.com',
    youtube: 'https://www.youtube.com',
  },
  announcement: {
    enabled: false,
    text: '',
    href: '',
  },
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
});

const mergeSettings = (incoming) => ({
  ...DEFAULT_SETTINGS,
  ...incoming,
  socials: { ...DEFAULT_SETTINGS.socials, ...(incoming?.socials || {}) },
  announcement: { ...DEFAULT_SETTINGS.announcement, ...(incoming?.announcement || {}) },
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await settingsApi.publicGet();
      setSettings(mergeSettings(data));
    } catch (_err) {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    settingsApi.invalidate();
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
