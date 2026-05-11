import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign, FiBox } from 'react-icons/fi';
import { analyticsApi } from '../../../../api';
import './AnalyticsDashboard.css';

const formatCurrency = (n) =>
  `${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TND`;

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [ov, sa, tp] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.sales(days),
          analyticsApi.topProducts(8),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setSales(sa || []);
        setTopProducts(tp || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [days]);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: '#c00' }}>{error}</p>;
  if (!overview) return null;

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(overview.totalRevenue), icon: FiDollarSign },
    { label: 'Total Orders', value: (overview.totalOrders || 0).toLocaleString(), icon: FiShoppingCart },
    { label: 'Customers', value: (overview.totalCustomers || 0).toLocaleString(), icon: FiUsers },
    { label: 'Products', value: (overview.totalProducts || 0).toLocaleString(), icon: FiBox },
  ];

  const maxRevenue = Math.max(1, ...sales.map((s) => s.revenue || 0));
  const totalRevForRange = sales.reduce((sum, s) => sum + (s.revenue || 0), 0);

  // Build top categories from top products (rough proxy when no taxonomy data)
  const productRevenue = topProducts.reduce((sum, p) => sum + (p.revenue || 0), 0) || 1;
  const topCategories = topProducts.slice(0, 5).map((p) => ({
    name: p.name,
    revenue: p.revenue || 0,
    percentage: Math.round(((p.revenue || 0) / productRevenue) * 100),
  }));

  return (
    <div className="analytics-dashboard">
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Range:</label>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 12 months</option>
        </select>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">
              <metric.icon />
            </div>
            <div className="metric-content">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
              <span className="metric-change positive">
                <FiTrendingUp />
                live
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <span className="chart-period">
              {formatCurrency(totalRevForRange)} · last {days} days
            </span>
          </div>
          <div className="bar-chart">
            {sales.length === 0 ? (
              <p style={{ color: '#888' }}>No sales in selected range.</p>
            ) : (
              sales.map((data) => (
                <div key={data._id} className="bar-item">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="bar-value">{(data.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <span className="bar-label">{data._id.slice(5)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Products</h3>
            <span className="chart-period">By revenue</span>
          </div>
          <div className="categories-chart">
            {topCategories.length === 0 && <p style={{ color: '#888' }}>No data.</p>}
            {topCategories.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className="category-value">{category.revenue.toLocaleString()} TND</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                <span className="category-percentage">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="activity-card">
        <div className="chart-header">
          <h3>Order Status Breakdown</h3>
        </div>
        <div className="activity-list">
          {Object.entries(overview.statusCounts || {}).map(([status, count]) => (
            <div key={status} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <span className="activity-action">{status}</span>
                <span className="activity-detail">{count} orders</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
