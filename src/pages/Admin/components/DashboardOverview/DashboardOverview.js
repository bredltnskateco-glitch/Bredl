import React from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiBox, FiEye } from 'react-icons/fi';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const stats = [
    { label: 'Total Revenue', value: '124,563 TND', icon: FiDollarSign, change: '+12.5%', positive: true },
    { label: 'Total Orders', value: '1,847', icon: FiShoppingCart, change: '+8.2%', positive: true },
    { label: 'Total Products', value: '486', icon: FiBox, change: '+3.1%', positive: true },
    { label: 'Total Visitors', value: '28,491', icon: FiEye, change: '-2.4%', positive: false }
  ];

  const recentOrders = [
    { id: '#RM-2847', customer: 'John Doe', product: 'Palace Tri-Ferg Tee', amount: '85.00 TND', status: 'Completed' },
    { id: '#RM-2846', customer: 'Sarah Smith', product: 'Nike SB Dunk Low', amount: '120.00 TND', status: 'Processing' },
    { id: '#RM-2845', customer: 'Mike Johnson', product: 'Thrasher Hoodie', amount: '95.00 TND', status: 'Shipped' },
    { id: '#RM-2844', customer: 'Emma Wilson', product: 'Santa Cruz Complete', amount: '180.00 TND', status: 'Pending' },
    { id: '#RM-2843', customer: 'Alex Brown', product: 'Vans Old Skool', amount: '75.00 TND', status: 'Completed' }
  ];

  const topProducts = [
    { name: 'Nike SB Dunk Low Pro', sales: 284, revenue: '34,080 TND' },
    { name: 'Palace Tri-Ferg Tee', sales: 196, revenue: '16,660 TND' },
    { name: 'Supreme Box Logo Hoodie', sales: 167, revenue: '50,100 TND' },
    { name: 'Thrasher Flame Logo Tee', sales: 142, revenue: '4,970 TND' },
    { name: 'Vans Old Skool Pro', sales: 128, revenue: '10,240 TND' }
  ];

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                <FiTrendingUp />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.product}</td>
                    <td className="order-amount">{order.amount}</td>
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

        {/* Top Products */}
        <div className="dashboard-card products-card">
          <div className="card-header">
            <h3>Top Products</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="top-products">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <span className="product-rank">#{index + 1}</span>
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-sales">{product.sales} sales</span>
                </div>
                <span className="product-revenue">{product.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
