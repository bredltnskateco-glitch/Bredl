import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiX } from 'react-icons/fi';
import { customersApi } from '../../../../api';
import './CustomersManager.css';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customersApi.list();
      setCustomers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatJoined = (d) => (d ? new Date(d).toLocaleDateString() : '');

  return (
    <div className="customers-manager">
      <div className="customers-header">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="customer-stats">
          <div className="stat-box">
            <span className="stat-value">{customers.length}</span>
            <span className="stat-label">Total Customers</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">
              {customers.reduce((sum, c) => sum + (c.spent || 0), 0).toLocaleString()} TND
            </span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {loading && <p>Loading customers...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card" onClick={() => setSelectedCustomer(customer)}>
              <div className="customer-avatar">
                {(customer.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="customer-info">
                <h3 className="customer-name">{customer.name}</h3>
                <p className="customer-email">{customer.email}</p>
              </div>
              <div className="customer-stats-row">
                <div className="stat">
                  <FiShoppingBag />
                  <span>{customer.orders} orders</span>
                </div>
                <div className="stat">
                  <span className="spent">{Number(customer.spent || 0).toFixed(2)} TND</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="customer-profile">
                <div className="profile-avatar">
                  {(selectedCustomer.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="profile-info">
                  <h3>{selectedCustomer.name}</h3>
                  <p>Customer since {formatJoined(selectedCustomer.joined)}</p>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <FiMail />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="contact-item">
                    <FiPhone />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.location && (
                  <div className="contact-item">
                    <FiMapPin />
                    <span>{selectedCustomer.location}</span>
                  </div>
                )}
              </div>

              <div className="customer-metrics">
                <div className="metric">
                  <span className="metric-value">{selectedCustomer.orders || 0}</span>
                  <span className="metric-label">Total Orders</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{Number(selectedCustomer.spent || 0).toFixed(2)} TND</span>
                  <span className="metric-label">Total Spent</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {selectedCustomer.orders
                      ? (selectedCustomer.spent / selectedCustomer.orders).toFixed(2)
                      : '0.00'} TND
                  </span>
                  <span className="metric-label">Avg. Order</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
              <a className="btn-primary" href={`mailto:${selectedCustomer.email}`}>Send Email</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManager;
