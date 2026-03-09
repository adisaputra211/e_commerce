"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./dashboard.module.css";

const ORDER_HISTORY = [
  { id: "#ORD-101", date: "Mar 5, 2026", product: "Samsung Galaxy S24 Ultra", amount: "Rp 18.599.000", status: "delivered" },
  { id: "#ORD-102", date: "Mar 3, 2026", product: "Sony WH-1000XM5", amount: "Rp 5.409.000", status: "in_transit" },
  { id: "#ORD-103", date: "Feb 28, 2026", product: "Apple Watch Series 9", amount: "Rp 6.199.000", status: "delivered" },
  { id: "#ORD-104", date: "Feb 25, 2026", product: "iPad Pro 11\"", amount: "Rp 12.399.000", status: "delivered" },
  { id: "#ORD-105", date: "Feb 20, 2026", product: "AirPods Pro 2", amount: "Rp 3.859.000", status: "delivered" },
  { id: "#ORD-106", date: "Feb 15, 2026", product: "iPhone 15 Pro Max", amount: "Rp 17.039.000", status: "delivered" },
];

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isUser, isLoading, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Indonesia",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isUser)) {
      router.push("/login");
    }
  }, [isAuthenticated, isUser, isLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        bio: "",
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isUser) {
    return null;
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUser(profileData);
    showNotification("Profile updated successfully!");
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("New passwords do not match!", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification("Password must be at least 6 characters!", "error");
      return;
    }
    showNotification("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    showNotification("Address updated successfully!");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "profile", label: "Profile", icon: "person" },
    { id: "security", label: "Security", icon: "security" },
    { id: "address", label: "Address", icon: "location_on" },
    { id: "preferences", label: "Preferences", icon: "settings" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      delivered: "#16a34a",
      in_transit: "#135bec",
      processing: "#8b5cf6",
      pending: "#f59e0b",
    };
    return colors[status] || "#64748b";
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: "Delivered",
      in_transit: "In Transit",
      processing: "Processing",
      pending: "Pending",
    };
    return labels[status] || status;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        {/* Notification */}
        {notification && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            <span className="material-symbols-outlined">
              {notification.type === "success" ? "check_circle" : "error"}
            </span>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>My Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Welcome back, {user?.name}!
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.shopBtn}>
              <span className="material-symbols-outlined">storefront</span>
              Continue Shopping
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        <div className={styles.accountContent}>
          {/* Sidebar Tabs */}
          <aside className={styles.accountSidebar}>
            <nav className={styles.tabNav}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${
                    activeTab === tab.id ? styles.tabBtnActive : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* User Info Card */}
            <div className={styles.userInfoCard}>
              <div className={styles.userAvatar}>
                {user?.avatar || user?.name?.charAt(0) || "U"}
              </div>
              <h3 className={styles.userName}>{user?.name}</h3>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.accountMain}>
            {/* Overview Tab - Order History */}
            {activeTab === "overview" && (
              <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    <span className="material-symbols-outlined">history</span>
                    Order History
                  </h2>
                  <Link href="/user/orders" className={styles.viewAllLink}>
                    View All Orders
                    <span className="material-symbols-outlined">chevron_right</span>
                  </Link>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ORDER_HISTORY.map((order) => (
                        <tr key={order.id}>
                          <td className={styles.orderId}>{order.id}</td>
                          <td className={styles.date}>{order.date}</td>
                          <td>{order.product}</td>
                          <td className={styles.amount}>{order.amount}</td>
                          <td>
                            <span
                              className={styles.statusBadge}
                              style={{ background: `${getStatusColor(order.status)}15`, color: getStatusColor(order.status) }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td>
                            <button className={styles.viewBtn}>
                              <span className="material-symbols-outlined">visibility</span>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    <span className="material-symbols-outlined">person</span>
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <button
                      className={styles.editBtn}
                      onClick={() => setIsEditing(true)}
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Edit Profile
                    </button>
                  ) : (
                    <div className={styles.editActions}>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            name: user?.name || "",
                            email: user?.email || "",
                            phone: "",
                            bio: "",
                          });
                        }}
                      >
                        <span className="material-symbols-outlined">close</span>
                        Cancel
                      </button>
                      <button
                        className={styles.saveBtn}
                        onClick={handleProfileSubmit}
                      >
                        <span className="material-symbols-outlined">check</span>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <form className={styles.form}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          person
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email Address</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          mail
                        </span>
                        <input
                          type="email"
                          className={styles.input}
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          phone
                        </span>
                        <input
                          type="tel"
                          className={styles.input}
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Member Since</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          calendar_today
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value="March 2026"
                          disabled
                        />
                      </div>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>Bio</label>
                      <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({ ...profileData, bio: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    <span className="material-symbols-outlined">security</span>
                    Security Settings
                  </h2>
                </div>

                <form className={styles.form} onSubmit={handlePasswordSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Current Password</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          lock
                        </span>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className={styles.input}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          className={styles.togglePassword}
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showCurrentPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>New Password</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          lock
                        </span>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className={styles.input}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          className={styles.togglePassword}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showNewPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Confirm New Password</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          lock
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={styles.input}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          className={styles.togglePassword}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <span className="material-symbols-outlined">
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn}>
                      <span className="material-symbols-outlined">check</span>
                      Change Password
                    </button>
                  </div>
                </form>

                <div className={styles.securityInfo}>
                  <h3 className={styles.infoTitle}>
                    <span className="material-symbols-outlined">info</span>
                    Password Tips
                  </h3>
                  <ul className={styles.tipsList}>
                    <li>Use at least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Add numbers and special characters</li>
                    <li>Don&apos;t use personal information</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    <span className="material-symbols-outlined">location_on</span>
                    Shipping Address
                  </h2>
                </div>

                <form className={styles.form} onSubmit={handleAddressSubmit}>
                  <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.formLabel}>Street Address</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          home
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={addressData.street}
                          onChange={(e) =>
                            setAddressData({ ...addressData, street: e.target.value })
                          }
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>City</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          location_city
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={addressData.city}
                          onChange={(e) =>
                            setAddressData({ ...addressData, city: e.target.value })
                          }
                          placeholder="Enter city"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Province</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          map
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={addressData.province}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              province: e.target.value,
                            })
                          }
                          placeholder="Enter province"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Postal Code</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          pin_drop
                        </span>
                        <input
                          type="text"
                          className={styles.input}
                          value={addressData.postalCode}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="Enter postal code"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Country</label>
                      <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined input-icon">
                          public
                        </span>
                        <select
                          className={styles.input}
                          value={addressData.country}
                          onChange={(e) =>
                            setAddressData({ ...addressData, country: e.target.value })
                          }
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn}>
                      <span className="material-symbols-outlined">check</span>
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className={styles.tabContent}>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    <span className="material-symbols-outlined">settings</span>
                    Preferences
                  </h2>
                </div>

                <div className={styles.preferencesGrid}>
                  <div className={styles.preferenceCard}>
                    <div className={styles.preferenceHeader}>
                      <div className={styles.preferenceIcon}>
                        <span className="material-symbols-outlined">notifications</span>
                      </div>
                      <div className={styles.preferenceInfo}>
                        <h3 className={styles.preferenceTitle}>Email Notifications</h3>
                        <p className={styles.preferenceDesc}>
                          Receive order updates and promotions
                        </p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.preferenceCard}>
                    <div className={styles.preferenceHeader}>
                      <div className={styles.preferenceIcon}>
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <div className={styles.preferenceInfo}>
                        <h3 className={styles.preferenceTitle}>Newsletter</h3>
                        <p className={styles.preferenceDesc}>
                          Subscribe to our newsletter
                        </p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.preferenceCard}>
                    <div className={styles.preferenceHeader}>
                      <div className={styles.preferenceIcon}>
                        <span className="material-symbols-outlined">dark_mode</span>
                      </div>
                      <div className={styles.preferenceInfo}>
                        <h3 className={styles.preferenceTitle}>Dark Mode</h3>
                        <p className={styles.preferenceDesc}>
                          Use dark theme across the app
                        </p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.preferenceCard}>
                    <div className={styles.preferenceHeader}>
                      <div className={styles.preferenceIcon}>
                        <span className="material-symbols-outlined">language</span>
                      </div>
                      <div className={styles.preferenceInfo}>
                        <h3 className={styles.preferenceTitle}>Language</h3>
                        <p className={styles.preferenceDesc}>
                          Select your preferred language
                        </p>
                      </div>
                      <select className={styles.langSelect}>
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
