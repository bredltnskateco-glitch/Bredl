import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiX, FiUsers } from 'react-icons/fi';
import { customersApi } from '../../../../api';
import { formatCurrency, formatDate } from '../../utils/format';
import EmptyState from '../EmptyState/EmptyState';
import './CustomersManager.css';

const getInitials = (name) =>
  String(name || '?')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

  const totalRevenue = customers.reduce((sum, c) => sum + (c.spent || 0), 0);

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
            <span className="stat-value">{formatCurrency(totalRevenue)}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {loading && <p>Loading customers...</p>}
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      {!loading && !error && filteredCustomers.length === 0 && (
        <EmptyState
          icon={FiUsers}
          title={customers.length === 0 ? 'No customers yet' : 'No customers match your search'}
          hint={
            customers.length === 0
              ? 'New shoppers who register on the storefront will appear here automatically.'
              : 'Try searching by a different name or email.'
          }
        />
      )}

      {!loading && !error && filteredCustomers.length > 0 && (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="customer-card" onClick={() => setSelectedCustomer(customer)}>
              <div className="customer-avatar">{getInitials(customer.name)}</div>
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
                  <span className="spent">{formatCurrency(customer.spent, { decimals: 2 })}</span>
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
                <div className="profile-avatar">{getInitials(selectedCustomer.name)}</div>
                <div className="profile-info">
                  <h3>{selectedCustomer.name}</h3>
                  <p>Customer since {formatDate(selectedCustomer.joined)}</p>
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
                  <span className="metric-value">{formatCurrency(selectedCustomer.spent, { decimals: 2 })}</span>
                  <span className="metric-label">Total Spent</span>
                </div>
                <div className="metric">
                  <span className="metric-value">
                    {formatCurrency(
                      selectedCustomer.orders ? selectedCustomer.spent / selectedCustomer.orders : 0,
                      { decimals: 2 }
                    )}
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
