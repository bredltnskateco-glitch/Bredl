import React, { useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiCheck, FiTruck, FiX } from 'react-icons/fi';
import './OrdersManager.css';

const OrdersManager = () => {
  const [orders, setOrders] = useState([
    { id: '#RM-2847', customer: 'John Doe', email: 'john@example.com', products: ['Palace Tri-Ferg Tee'], amount: 85.00, date: '2026-01-19', status: 'Completed' },
    { id: '#RM-2846', customer: 'Sarah Smith', email: 'sarah@example.com', products: ['Nike SB Dunk Low', 'Thrasher Tee'], amount: 155.00, date: '2026-01-19', status: 'Processing' },
    { id: '#RM-2845', customer: 'Mike Johnson', email: 'mike@example.com', products: ['Thrasher Hoodie'], amount: 95.00, date: '2026-01-18', status: 'Shipped' },
    { id: '#RM-2844', customer: 'Emma Wilson', email: 'emma@example.com', products: ['Santa Cruz Complete', 'Bearings'], amount: 210.00, date: '2026-01-18', status: 'Pending' },
    { id: '#RM-2843', customer: 'Alex Brown', email: 'alex@example.com', products: ['Vans Old Skool'], amount: 75.00, date: '2026-01-17', status: 'Completed' },
    { id: '#RM-2842', customer: 'Lisa Davis', email: 'lisa@example.com', products: ['Supreme Hoodie', 'Cap', 'Socks'], amount: 380.00, date: '2026-01-17', status: 'Cancelled' },
    { id: '#RM-2841', customer: 'Tom Garcia', email: 'tom@example.com', products: ['Carhartt Jacket'], amount: 180.00, date: '2026-01-16', status: 'Completed' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return <FiCheck />;
      case 'shipped': return <FiTruck />;
      case 'cancelled': return <FiX />;
      default: return null;
    }
  };

  return (
    <div className="orders-manager">
      {/* Header */}
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
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="orders-stats">
          <span className="stat-item">
            <span className="stat-count">{orders.filter(o => o.status === 'Pending').length}</span>
            Pending
          </span>
          <span className="stat-item">
            <span className="stat-count">{orders.filter(o => o.status === 'Processing').length}</span>
            Processing
          </span>
          <span className="stat-item">
            <span className="stat-count">{orders.filter(o => o.status === 'Shipped').length}</span>
            Shipped
          </span>
        </div>
      </div>

      {/* Orders Table */}
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
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{order.customer}</span>
                    <span className="customer-email">{order.email}</span>
                  </div>
                </td>
                <td>
                  <div className="products-cell">
                    {order.products.slice(0, 2).join(', ')}
                    {order.products.length > 2 && ` +${order.products.length - 2} more`}
                  </div>
                </td>
                <td className="amount-cell">{order.amount.toFixed(2)} TND</td>
                <td className="date-cell">{order.date}</td>
                <td>
                  <select 
                    className={`status-select ${getStatusClass(order.status)}`}
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    {statusOptions.map(status => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.id}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer}</p>
                  <p><strong>Email:</strong> {selectedOrder.email}</p>
                </div>
                <div className="detail-section">
                  <h4>Order Information</h4>
                  <p><strong>Date:</strong> {selectedOrder.date}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="detail-section products-section">
                <h4>Products</h4>
                <ul className="products-list">
                  {selectedOrder.products.map((product, idx) => (
                    <li key={idx}>{product}</li>
                  ))}
                </ul>
              </div>

              <div className="order-total">
                <span>Total Amount</span>
                <span className="total-amount">{selectedOrder.amount.toFixed(2)} TND</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <select 
                className={`status-select large ${getStatusClass(selectedOrder.status)}`}
                value={selectedOrder.status}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder.id, e.target.value);
                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                }}
              >
                {statusOptions.map(status => (
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
