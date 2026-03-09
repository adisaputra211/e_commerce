"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./dashboard.module.css";

const ADMIN_STATS = [
  { label: "Total Sales", value: "Rp 699.177.000", change: "+12.5%", icon: "trending_up", color: "#16a34a" },
  { label: "Total Orders", value: "1,234", change: "+8.2%", icon: "shopping_cart", color: "#135bec" },
  { label: "Total Users", value: "5,678", change: "+15.3%", icon: "people", color: "#8b5cf6" },
  { label: "Products", value: "892", change: "+5.1%", icon: "inventory", color: "#f59e0b" },
];

const RECENT_ORDERS = [
  { id: "#ORD-001", customer: "Alice Johnson", product: "iPhone 15 Pro", amount: "Rp 15.489.000", status: "completed" },
  { id: "#ORD-002", customer: "Bob Smith", product: "MacBook Pro 14\"", amount: "Rp 30.989.000", status: "processing" },
  { id: "#ORD-003", customer: "Carol White", product: "AirPods Pro", amount: "Rp 3.859.000", status: "shipped" },
  { id: "#ORD-004", customer: "David Brown", product: "iPad Air", amount: "Rp 9.289.000", status: "pending" },
  { id: "#ORD-005", customer: "Eva Martinez", product: "Apple Watch Ultra", amount: "Rp 12.399.000", status: "completed" },
];

const TOP_PRODUCTS = [
  { name: "iPhone 15 Pro Max", sales: 234, revenue: "Rp 3.996.126.000", image: "📱" },
  { name: "MacBook Pro M3", sales: 156, revenue: "Rp 4.844.484.000", image: "💻" },
  { name: "AirPods Pro 2", sales: 445, revenue: "Rp 1.727.255.000", image: "🎧" },
  { name: "Samsung Galaxy S24", sales: 189, revenue: "Rp 2.879.421.000", image: "📱" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
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
    };
    return colors[status] || "#64748b";
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        {/* Header */}
        <div className={styles.dashHeader}>
          <div className={styles.dashHeaderLeft}>
            <h1 className={styles.dashTitle}>Admin Dashboard</h1>
            <p className={styles.dashSubtitle}>Welcome back, {user?.name}!</p>
          </div>
          <div className={styles.dashHeaderRight}>
            <button className={styles.dashBtn} onClick={() => router.push("/")}>
              <span className="material-symbols-outlined">storefront</span>
              View Store
            </button>
            <button className={styles.logoutBtn} onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
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
                  {stat.change} from last month
                </p>
              </div>
            </div>
          ))}
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
              <Link href="#" className={styles.cardLink}>
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
                          style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}
                        >
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
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <span className="material-symbols-outlined">leaderboard</span>
                Top Products
              </h2>
              <Link href="#" className={styles.cardLink}>
                View All
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            </div>
            <div className={styles.productsList}>
              {TOP_PRODUCTS.map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productEmoji}>{product.image}</div>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{product.name}</p>
                    <p className={styles.productSales}>{product.sales} sales</p>
                  </div>
                  <div className={styles.productRevenue}>
                    <p className={styles.revenueValue}>{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
