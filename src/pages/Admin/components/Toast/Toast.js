import React, { useEffect, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

// Module-scoped pub-sub. A single <ToastContainer /> should be mounted at the
// admin dashboard root. Anyone may call `toast.success(...)` etc. without
// needing to pass a context down.

const listeners = new Set();
let nextId = 1;

const emit = (entry) => {
  const id = nextId++;
  const full = { id, ...entry };
  listeners.forEach((fn) => fn(full));
};

export const toast = {
  success: (message, opts = {}) => emit({ type: 'success', message, duration: opts.duration ?? 3000 }),
  error: (message, opts = {}) => emit({ type: 'error', message, duration: opts.duration ?? 5000 }),
  info: (message, opts = {}) => emit({ type: 'info', message, duration: opts.duration ?? 3000 }),
};

const iconFor = (type) => {
  if (type === 'success') return <FiCheckCircle aria-hidden="true" />;
  if (type === 'error') return <FiAlertTriangle aria-hidden="true" />;
  return <FiInfo aria-hidden="true" />;
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (entry) => {
      setToasts((prev) => [...prev, entry]);
      if (entry.duration > 0) {
        setTimeout(() => dismiss(entry.id), entry.duration);
      }
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast ${t.type}`}>
          <span className="admin-toast-icon" aria-hidden="true">{iconFor(t.type)}</span>
          <span className="admin-toast-message">{t.message}</span>
          <button
            type="button"
            className="admin-toast-close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
