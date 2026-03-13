"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./dashboard.module.css";

const ADMIN_STATS = [
  { label: "Total Sales", value: "Rp 699.177.000", change: "+12.5%", icon: "trending_up", color: "#16a34a" },
  { label: "Total Orders", value: "1,234", change: "+8.2%", icon: "shopping_cart", color: "#135bec" },
  { label: "Products", value: "892", change: "+5.1%", icon: "inventory", color: "#f59e0b" },
];

const RECENT_ORDERS = [
  { id: "#ORD-001", customer: "Alice Johnson", product: "iPhone 15 Pro", amount: "Rp 15.489.000", status: "completed", date: "2026-03-10" },
  { id: "#ORD-002", customer: "Bob Smith", product: "MacBook Pro 14\"", amount: "Rp 30.989.000", status: "processing", date: "2026-03-10" },
  { id: "#ORD-003", customer: "Carol White", product: "AirPods Pro", amount: "Rp 3.859.000", status: "shipped", date: "2026-03-09" },
  { id: "#ORD-004", customer: "David Brown", product: "iPad Air", amount: "Rp 9.289.000", status: "pending", date: "2026-03-09" },
  { id: "#ORD-005", customer: "Eva Martinez", product: "Apple Watch Ultra", amount: "Rp 12.399.000", status: "completed", date: "2026-03-08" },
];



export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: "#16a34a",
      processing: "#135bec",
      shipped: "#8b5cf6",
      pending: "#f59e0b",
      cancelled: "#dc2626",
      paid: "#10b981",
    };
    return colors[status] || "#64748b";
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        {/* Header */}
        <div className={styles.dashHeader}>
          <div className={styles.dashHeaderLeft}>
            <h1 className={styles.dashTitle}>Dashboard Overview</h1>
            <p className={styles.dashSubtitle}>Welcome back, {user?.name}! Here's what's happening today.</p>
          </div>
          <div className={styles.dashHeaderRight}>
            <Link href="/admin/products" className={styles.primaryBtn}>
              <span className="material-symbols-outlined">add</span>
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {ADMIN_STATS.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: `${stat.color}15` }}>
                <span className="material-symbols-outlined" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statChange} style={{ color: stat.color }}>
                  <span className="material-symbols-outlined">trending_up</span>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/products?action=create" className={styles.actionCard}>
              <span className="material-symbols-outlined" style={{ color: "#3b82f6" }}>add_box</span>
              <span>Add Product</span>
            </Link>
            <Link href="/admin/orders" className={styles.actionCard}>
              <span className="material-symbols-outlined" style={{ color: "#16a34a" }}>pending_actions</span>
              <span>Orders</span>
            </Link>
            <Link href="/admin/categories" className={styles.actionCard}>
              <span className="material-symbols-outlined" style={{ color: "#8b5cf6" }}>category</span>
              <span>Categories</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Recent Orders */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className="material-symbols-outlined">receipt_long</span>
                Recent Orders
              </h2>
              <Link href="/admin/orders" className={styles.cardLink}>
                View All
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id}>
                      <td className={styles.orderId}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td className={styles.amount}>{order.amount}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: `${getStatusColor(order.status)}15`,
                            color: getStatusColor(order.status)
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.date}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <h2 className={styles.alertTitle}>
                <span className="material-symbols-outlined" style={{ color: "#f59e0b" }}>warning</span>
                Low Stock Alert
              </h2>
              <Link href="/admin/products?filter=low-stock" className={styles.alertLink}>
                View All
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className={styles.lowStockList}>
              <div className={styles.stockItem}>
                <span className={styles.stockName}>iPhone 15 Pro Max 256GB</span>
                <span className={styles.stockCount}>3 remaining</span>
              </div>
              <div className={styles.stockItem}>
                <span className={styles.stockName}>MacBook Pro M3 Pro</span>
                <span className={styles.stockCount}>5 remaining</span>
              </div>
              <div className={styles.stockItem}>
                <span className={styles.stockName}>Samsung Galaxy Tab S9 Ultra</span>
                <span className={styles.stockCount}>2 remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
