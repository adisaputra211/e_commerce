"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthProvider } from "@/context/AuthContext";
import styles from "./adminLayout.module.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard", badge: null },
  { href: "/admin/products", label: "Products", icon: "inventory_2", badge: null },
  { href: "/admin/categories", label: "Categories", icon: "category", badge: null },
  { href: "/admin/orders", label: "Orders", icon: "shopping_cart", badge: "3" },
];

function AdminSidebar({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          {sidebarOpen && (
            <Link href="/admin/dashboard" className={styles.logo}>
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className={styles.logoText}>ShopX Admin</span>
            </Link>
          )}
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.avatar?.charAt(0) || "A"}</div>
            {sidebarOpen && (
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userRole}>Administrator</p>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminSidebar>{children}</AdminSidebar>
    </AuthProvider>
  );
}
