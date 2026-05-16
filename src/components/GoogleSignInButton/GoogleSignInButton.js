import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Loads Google Identity Services once per page and caches the promise so
// remounting Login/Register doesn't append duplicate <script> tags.
let gisPromise = null;
const loadGoogleScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Failed to load Google script'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
};

const GoogleSignInButton = ({ label = 'continue_with', onError, onMfaRequired, onSuccess }) => {
  const containerRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return undefined;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      try {
        const google = await loadGoogleScript();
        if (cancelled || !google?.accounts?.id || !containerRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) {
              setError('No credential returned from Google.');
              return;
            }
            setSubmitting(true);
            setError('');
            const result = await loginWithGoogle(response.credential);
            setSubmitting(false);
            if (!result.success) {
              setError(result.error);
              onError?.(result.error);
              return;
            }
            if (result.mfaRequired) {
              onMfaRequired?.();
              return;
            }
            onSuccess?.(result.user);
          },
        });

        google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: label,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: containerRef.current.clientWidth || 320,
        });

        cleanup = () => {
          try { google.accounts.id.cancel(); } catch (_) { /* noop */ }
        };
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not initialize Google sign-in');
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [loginWithGoogle, label, onError, onMfaRequired, onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    if (process.env.NODE_ENV === 'production') return null;
    return (
      <p className="google-signin-disabled">
        Sign in with Google is disabled — set <code>REACT_APP_GOOGLE_CLIENT_ID</code> to enable it.
      </p>
    );
  }

  return (
    <div className="google-signin">
      <div ref={containerRef} className="google-signin-button" aria-busy={submitting} />
      {error && <p className="google-signin-error">{error}</p>}
    </div>
  );
};

export default GoogleSignInButton;
