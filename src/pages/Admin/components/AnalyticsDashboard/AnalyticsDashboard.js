import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingCart, FiDollarSign, FiEye } from 'react-icons/fi';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const metrics = [
    { label: 'Total Revenue', value: '124,563 TND', change: '+12.5%', positive: true, icon: FiDollarSign },
    { label: 'Total Orders', value: '1,847', change: '+8.2%', positive: true, icon: FiShoppingCart },
    { label: 'New Customers', value: '284', change: '+15.3%', positive: true, icon: FiUsers },
    { label: 'Page Views', value: '58,291', change: '-2.4%', positive: false, icon: FiEye },
  ];

  const topCategories = [
    { name: 'Streetwear', revenue: 45230, percentage: 36 },
    { name: 'Shoes', revenue: 32150, percentage: 26 },
    { name: 'Accessories', revenue: 21890, percentage: 18 },
    { name: 'Skate', revenue: 15120, percentage: 12 },
    { name: 'Other', revenue: 10173, percentage: 8 },
  ];

  const recentActivity = [
    { action: 'New order', detail: '#RM-2847 by John Doe', time: '2 minutes ago' },
    { action: 'Product updated', detail: 'Nike SB Dunk Low', time: '15 minutes ago' },
    { action: 'New customer', detail: 'sarah@example.com', time: '1 hour ago' },
    { action: 'Order shipped', detail: '#RM-2845 to Chicago', time: '2 hours ago' },
    { action: 'New review', detail: '5 stars on Palace Tee', time: '3 hours ago' },
  ];

  const monthlyData = [
    { month: 'Aug', revenue: 18500 },
    { month: 'Sep', revenue: 22300 },
    { month: 'Oct', revenue: 19800 },
    { month: 'Nov', revenue: 28900 },
    { month: 'Dec', revenue: 35100 },
    { month: 'Jan', revenue: 31200 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="analytics-dashboard">
      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">
              <metric.icon />
            </div>
            <div className="metric-content">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
              <span className={`metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                {metric.positive ? <FiTrendingUp /> : <FiTrendingDown />}
                {metric.change} vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <span className="chart-period">Last 6 months</span>
          </div>
          <div className="bar-chart">
            {monthlyData.map((data, index) => (
              <div key={index} className="bar-item">
                <div className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="bar-value">{(data.revenue / 1000).toFixed(1)}k TND</span>
                  </div>
                </div>
                <span className="bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Categories</h3>
            <span className="chart-period">By revenue</span>
          </div>
          <div className="categories-chart">
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

      {/* Activity Feed */}
      <div className="activity-card">
        <div className="chart-header">
          <h3>Recent Activity</h3>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <span className="activity-action">{activity.action}</span>
                <span className="activity-detail">{activity.detail}</span>
              </div>
              <span className="activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
