import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiEye, FiCheck, FiTruck, FiX, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import { ordersApi } from '../../../../api';
import { formatCurrency, formatDate, customerName } from '../../utils/format';
import { getStatusClass, ORDER_STATUSES } from '../../utils/status';
import { toast } from '../Toast/Toast';
import EmptyState from '../EmptyState/EmptyState';
import './OrdersManager.css';

const statusOptions = ORDER_STATUSES;

const PAYMENT_METHOD_LABELS = {
  cod: 'Cash on Delivery',
  flouci: 'Flouci',
  d17: 'D17',
  visa: 'Visa',
  mastercard: 'MasterCard',
  transfer: 'Bank Transfer',
  card: 'Card (legacy)',
};

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.list({ limit: 200 });
      setOrders(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const [savingStatusId, setSavingStatusId] = useState(null);

  const updateOrderStatus = async (orderId, newStatus) => {
    setSavingStatusId(orderId);
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success(`Order moved to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingStatusId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const name = customerName(order);
    const haystack = `${order.orderNumber || ''} ${name} ${order.user?.email || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return <FiCheck />;
      case 'shipped': return <FiTruck />;
      case 'cancelled': return <FiX />;
      default: return null;
    }
  };

  return (
    <div className="orders-manager">
      <div className="orders-header">
        <div className="search-filter">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FiFilter />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="orders-stats">
          <span className="stat-item">
            <span className="stat-count">{orders.filter((o) => o.status === 'Pending').length}</span>
            Pending
          </span>
          <span className="stat-item">
            <span className="stat-count">{orders.filter((o) => o.status === 'Processing').length}</span>
            Processing
          </span>
          <span className="stat-item">
            <span className="stat-count">{orders.filter((o) => o.status === 'Shipped').length}</span>
            Shipped
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={load}
            disabled={loading}
            aria-label="Refresh orders"
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filteredOrders.length === 0 && (
        <EmptyState
          icon={FiShoppingBag}
          title={orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          hint={
            orders.length === 0
              ? 'New orders placed in the storefront will appear here in real time.'
              : 'Try clearing the search or changing the status filter.'
          }
        />
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="admin-data-table orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const productNames = (order.items || []).map((i) => i.name);
                const isSaving = savingStatusId === order._id;
                return (
                  <tr key={order._id}>
                    <td className="order-id" data-label="Order ID">{order.orderNumber}</td>
                    <td data-label="Customer">
                      <div className="customer-cell">
                        <span className="customer-name">{customerName(order) || '—'}</span>
                        <span className="customer-email">{order.user?.email}</span>
                      </div>
                    </td>
                    <td data-label="Products">
                      <div className="products-cell">
                        {productNames.slice(0, 2).join(', ')}
                        {productNames.length > 2 && ` +${productNames.length - 2} more`}
                      </div>
                    </td>
                    <td className="amount-cell" data-label="Amount">{formatCurrency(order.total, { decimals: 2 })}</td>
                    <td className="date-cell" data-label="Date">{formatDate(order.createdAt)}</td>
                    <td data-label="Status">
                      <select
                        className={`status-select ${getStatusClass(order.status)}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={isSaving}
                        aria-busy={isSaving}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {isSaving && <span className="status-saving">Saving…</span>}
                    </td>
                    <td data-label="Actions">
                      <button className="view-btn" onClick={() => setSelectedOrder(order)}>
                        <FiEye />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.orderNumber}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.shippingAddress?.fullName || customerName(selectedOrder) || '—'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  {selectedOrder.shippingAddress?.phone && (
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                  )}
                  {selectedOrder.shippingAddress && (
                    <p>
                      <strong>Address:</strong>{' '}
                      {[
                        selectedOrder.shippingAddress.street,
                        selectedOrder.shippingAddress.city,
                        selectedOrder.shippingAddress.postalCode,
                        selectedOrder.shippingAddress.country,
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="detail-section">
                  <h4>Order Information</h4>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt, { withTime: true })}</p>
                  <p><strong>Payment:</strong> {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</p>
                  {selectedOrder.promoCode && (
                    <p><strong>Promo:</strong> {selectedOrder.promoCode}</p>
                  )}
                  <p><strong>Status:</strong>{' '}
                    <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="detail-section products-section">
                <h4>Products</h4>
                <ul className="products-list">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} — {formatCurrency(item.price, { decimals: 2 })}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-totals-block">
                <div className="order-totals-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.itemsTotal, { decimals: 2 })}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="order-totals-row discount">
                    <span>Discount{selectedOrder.promoCode ? ` (${selectedOrder.promoCode})` : ''}</span>
                    <span>−{formatCurrency(selectedOrder.discount, { decimals: 2 })}</span>
                  </div>
                )}
                <div className="order-totals-row">
                  <span>Shipping</span>
                  <span>{formatCurrency(selectedOrder.shippingCost, { decimals: 2 })}</span>
                </div>
                <div className="order-total">
                  <span>Total Amount</span>
                  <span className="total-amount">{formatCurrency(selectedOrder.total, { decimals: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <select
                className={`status-select large ${getStatusClass(selectedOrder.status)}`}
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
