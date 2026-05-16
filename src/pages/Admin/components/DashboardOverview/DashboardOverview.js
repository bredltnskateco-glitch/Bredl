import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiBox, FiUsers } from 'react-icons/fi';
import { analyticsApi } from '../../../../api';
import { formatCurrency, customerName } from '../../utils/format';
import { getStatusClass } from '../../utils/status';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, top] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.topProducts(5),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setTopProducts(top || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = overview ? [
    { label: 'Total Revenue', value: formatCurrency(overview.totalRevenue, { decimals: 2 }), icon: FiDollarSign },
    { label: 'Total Orders', value: Number(overview.totalOrders || 0).toLocaleString(), icon: FiShoppingCart },
    { label: 'Total Products', value: Number(overview.totalProducts || 0).toLocaleString(), icon: FiBox },
    { label: 'Total Customers', value: Number(overview.totalCustomers || 0).toLocaleString(), icon: FiUsers },
  ] : [];

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: '#c00' }}>{error}</p>;
  if (!overview) return null;

  return (
    <>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-change positive">
                <FiTrendingUp />
                live
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(overview.recentOrders || []).map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">{order.orderNumber}</td>
                    <td>{order.user ? customerName(order) : '—'}</td>
                    <td>{(order.items || []).length}</td>
                    <td className="order-amount">{formatCurrency(order.total, { decimals: 2 })}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card products-card">
          <div className="card-header">
            <h3>Top Products</h3>
          </div>
          <div className="top-products">
            {topProducts.map((product, index) => (
              <div key={product._id || index} className="product-item">
                <span className="product-rank">#{index + 1}</span>
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-sales">{product.sold} sold</span>
                </div>
                <span className="product-revenue">{formatCurrency(product.revenue, { decimals: 2 })}</span>
              </div>
            ))}
            {!topProducts.length && <p style={{ color: '#888' }}>No sales yet.</p>}
          </div>
        </div>
      </div>

      {(overview.lowStock || []).length > 0 && (
        <div className="dashboard-card products-card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h3>Low Stock Alerts</h3>
          </div>
          <div className="top-products">
            {overview.lowStock.map((p) => (
              <div key={p._id} className="product-item">
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-sales">{p.stock} in stock</span>
                </div>
                <span className="product-revenue">{formatCurrency(p.price, { decimals: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardOverview;
