import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiEye, FiCheck, FiTruck, FiX } from 'react-icons/fi';
import { ordersApi } from '../../../../api';
import './OrdersManager.css';

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const customerName = order.user
      ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
      : '';
    const haystack = `${order.orderNumber || ''} ${customerName} ${order.user?.email || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return <FiCheck />;
      case 'shipped': return <FiTruck />;
      case 'cancelled': return <FiX />;
      default: return null;
    }
  };

  const customerName = (o) =>
    o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : '';

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
        </div>
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && (
        <div className="orders-table-container">
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
                return (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderNumber}</td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{customerName(order) || '—'}</span>
                        <span className="customer-email">{order.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="products-cell">
                        {productNames.slice(0, 2).join(', ')}
                        {productNames.length > 2 && ` +${productNames.length - 2} more`}
                      </div>
                    </td>
                    <td className="amount-cell">{Number(order.total || 0).toFixed(2)} TND</td>
                    <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        className={`status-select ${getStatusClass(order.status)}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
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
                  <p><strong>Name:</strong> {customerName(selectedOrder) || '—'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
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
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
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
                      {item.name} × {item.quantity} — {Number(item.price).toFixed(2)} TND
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-total">
                <span>Total Amount</span>
                <span className="total-amount">{Number(selectedOrder.total || 0).toFixed(2)} TND</span>
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
