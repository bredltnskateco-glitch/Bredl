import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  hint,
  actionLabel,
  onAction,
}) => (
  <div className="admin-empty-state">
    <span className="admin-empty-state-icon">
      <Icon aria-hidden="true" />
    </span>
    <h3>{title}</h3>
    {hint && <p>{hint}</p>}
    {actionLabel && onAction && (
      <button type="button" className="admin-btn admin-btn-primary" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
