"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const isDashboardPage = pathname?.includes("/dashboard");

  const handleSignOut = () => {
    logout();
    setShowDropdown(false);
    router.push("/");
  };

  const handleNavClick = (role) => {
    setShowDropdown(false);
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="material-symbols-outlined logo-icon">shopping_bag</span>
          <span className="logo-text">ShopX</span>
        </Link>

        {/* Search Bar */}
        <div className="search-bar">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            placeholder="Search products, brands and categories..."
            className="search-input"
          />
          <button className="search-btn">Search</button>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <Link href="/cart" className="action-btn cart-btn">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="cart-badge">3</span>
          </Link>
          <div className="action-divider"></div>

          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="action-btn user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.avatar || "U"}
                </div>
                <span className="user-name">{user?.name?.split(" ")[0]}</span>
                <span className={`material-symbols-outlined dropdown-icon ${showDropdown ? "rotated" : ""}`}>
                  expand_more
                </span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user?.avatar || "U"}</div>
                    <div className="dropdown-info">
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-email">{user?.email}</p>
                      <span className={`dropdown-role ${user?.role === "admin" ? "admin" : "user"}`}>
                        {user?.role === "admin" ? "Administrator" : "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => handleNavClick(user?.role)}>
                    <span className="material-symbols-outlined">dashboard</span>
                    My Dashboard
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleSignOut}>
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="action-btn signin-btn">
              <span className="material-symbols-outlined">person</span>
              <span className="signin-text">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Secondary Nav */}
      {!isDashboardPage && (
        <nav className="secondary-nav">
          <div className="secondary-nav-inner">
            <Link href="/" className="nav-link nav-link-home">
              <span className="material-symbols-outlined nav-icon">home</span> Home
            </Link>
            <Link href="/listing" className="nav-link">Categories</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
