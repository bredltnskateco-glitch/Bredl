// Shared admin status helpers. Mirrors the CSS classes in admin-shared.css.

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

export const getStatusClass = (status) => {
  const key = String(status || '').toLowerCase();
  switch (key) {
    case 'completed': return 'status-completed';
    case 'processing': return 'status-processing';
    case 'shipped': return 'status-shipped';
    case 'pending': return 'status-pending';
    case 'cancelled': return 'status-cancelled';
    case 'active':
    case 'in stock':
    case 'in-stock':
      return 'status-active';
    case 'low stock':
    case 'low-stock':
    case 'low':
      return 'status-low';
    case 'out of stock':
    case 'out-of-stock':
    case 'out':
      return 'status-out';
    default: return '';
  }
};

export const getProductStockStatus = (stock, lowStockThreshold = 20) => {
  const n = Number(stock);
  if (!Number.isFinite(n) || n <= 0) return 'Out of Stock';
  if (n <= lowStockThreshold) return 'Low Stock';
  return 'Active';
};
