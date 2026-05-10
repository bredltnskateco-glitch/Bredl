import React, { useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiX } from 'react-icons/fi';
import './CustomersManager.css';

const CustomersManager = () => {
  const [customers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', location: 'New York, USA', orders: 12, spent: 1450.00, joined: '2025-06-15' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 234 567 891', location: 'Los Angeles, USA', orders: 8, spent: 890.00, joined: '2025-07-22' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 892', location: 'Chicago, USA', orders: 15, spent: 2100.00, joined: '2025-05-10' },
    { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 234 567 893', location: 'Miami, USA', orders: 6, spent: 650.00, joined: '2025-09-01' },
    { id: 5, name: 'Alex Brown', email: 'alex@example.com', phone: '+1 234 567 894', location: 'Seattle, USA', orders: 22, spent: 3200.00, joined: '2025-03-18' },
    { id: 6, name: 'Lisa Davis', email: 'lisa@example.com', phone: '+1 234 567 895', location: 'Denver, USA', orders: 4, spent: 380.00, joined: '2025-11-05' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-manager">
      {/* Header */}
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
            <span className="stat-value">{customers.reduce((sum, c) => sum + c.spent, 0).toLocaleString()} TND</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="customers-grid">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card" onClick={() => setSelectedCustomer(customer)}>
            <div className="customer-avatar">
              {customer.name.split(' ').map(n => n[0]).join('')}
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
                <span className="spent">{customer.spent.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Details Modal */}
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
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="profile-info">
                  <h3>{selectedCustomer.name}</h3>
                  <p>Customer since {selectedCustomer.joined}</p>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <FiMail />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="contact-item">
                  <FiPhone />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="contact-item">
                  <FiMapPin />
                  <span>{selectedCustomer.location}</span>
                </div>
              </div>

              <div className="customer-metrics">
                <div className="metric">
                  <span className="metric-value">{selectedCustomer.orders}</span>
                  <span className="metric-label">Total Orders</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{selectedCustomer.spent.toFixed(2)} TND</span>
                  <span className="metric-label">Total Spent</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{(selectedCustomer.spent / selectedCustomer.orders).toFixed(2)} TND</span>
                  <span className="metric-label">Avg. Order</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary">View Orders</button>
              <button className="btn-primary">Send Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManager;
