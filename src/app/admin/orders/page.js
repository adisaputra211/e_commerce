"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./orders.module.css";

const ORDER_STATUS = {
  pending: { label: "Pending", color: "#f59e0b" },
  paid: { label: "Paid", color: "#10b981" },
  processing: { label: "Processing", color: "#3b82f6" },
  shipped: { label: "Shipped", color: "#8b5cf6" },
  completed: { label: "Completed", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#dc2626" },
};

const PAYMENT_STATUS = {
  pending: { label: "Pending", color: "#f59e0b" },
  success: { label: "Success", color: "#16a34a" },
  failed: { label: "Failed", color: "#dc2626" },
  refunded: { label: "Refunded", color: "#64748b" },
};

const SAMPLE_ORDERS = [
  {
    id: "ORD-001",
    customer_name: "Alice Johnson",
    total_price: 15489000,
    shipping_cost: 25000,
    status: "completed",
    order_date: "2026-03-08T10:30:00",
    payment_method: "Credit Card",
    payment_status: "success",
    items: [
      { product_name: "iPhone 15 Pro", variant: "256GB Titanium", quantity: 1, price: 15489000 }
    ],
    shipping_address: "Jl. Sudirman No. 123, Jakarta",
    tracking_number: "JNE123456789",
    courier_name: "JNE",
  },
  {
    id: "ORD-002",
    customer_name: "Bob Smith",
    total_price: 30989000,
    shipping_cost: 50000,
    status: "processing",
    order_date: "2026-03-10T14:20:00",
    payment_method: "Bank Transfer",
    payment_status: "success",
    items: [
      { product_name: "MacBook Pro 14\"", variant: "M3 Pro 18GB", quantity: 1, price: 30989000 }
    ],
    shipping_address: "Jl. Gatot Subroto No. 45, Bandung",
    tracking_number: null,
    courier_name: null,
  },
  {
    id: "ORD-003",
    customer_name: "Carol White",
    total_price: 3859000,
    shipping_cost: 15000,
    status: "shipped",
    order_date: "2026-03-09T09:15:00",
    payment_method: "E-Wallet",
    payment_status: "success",
    items: [
      { product_name: "AirPods Pro", variant: "2nd Gen", quantity: 1, price: 3859000 }
    ],
    shipping_address: "Jl. Ahmad Yani No. 78, Surabaya",
    tracking_number: "SICEPAT987654",
    courier_name: "SiCepat",
  },
  {
    id: "ORD-004",
    customer_name: "David Brown",
    total_price: 9289000,
    shipping_cost: 30000,
    status: "pending",
    order_date: "2026-03-10T16:45:00",
    payment_method: "Credit Card",
    payment_status: "pending",
    items: [
      { product_name: "iPad Air", variant: "M2 11\" WiFi", quantity: 1, price: 9289000 }
    ],
    shipping_address: "Jl. Diponegoro No. 90, Yogyakarta",
    tracking_number: null,
    courier_name: null,
  },
  {
    id: "ORD-005",
    customer_name: "Eva Martinez",
    total_price: 12399000,
    shipping_cost: 35000,
    status: "completed",
    order_date: "2026-03-07T11:00:00",
    payment_method: "Bank Transfer",
    payment_status: "success",
    items: [
      { product_name: "Apple Watch Ultra", variant: "49mm Titanium", quantity: 1, price: 12399000 }
    ],
    shipping_address: "Jl. Thamrin No. 56, Medan",
    tracking_number: "ANTERAJA456789",
    courier_name: "AnterAja",
  },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchOrders();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      
      if (res.ok) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Update selected order if it's open in modal
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdatePayment = (orderId, newPaymentStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, payment_status: newPaymentStatus } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
    }
  };

  const handleAddTracking = (orderId, trackingData) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        tracking_number: trackingData.tracking_number,
        courier_name: trackingData.courier_name,
        status: "shipped"
      } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ 
        ...prev, 
        tracking_number: trackingData.tracking_number,
        courier_name: trackingData.courier_name,
        status: "shipped"
      }));
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || loading || !isAuthenticated || !isAdmin) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>Orders Management</h1>
            <p className={styles.pageSubtitle}>Manage customer orders, payments, and shipments</p>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{orders.filter(o => o.status === 'pending').length}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{orders.filter(o => o.status === 'processing').length}</span>
              <span className={styles.statLabel}>Processing</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{orders.filter(o => o.status === 'shipped').length}</span>
              <span className={styles.statLabel}>Shipped</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            {Object.entries(ORDER_STATUS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <div className={styles.resultsInfo}>
            {filteredOrders.length} orders found
          </div>
        </div>

        {/* Orders Table */}
        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderId}>{order.id}</td>
                    <td>
                      <div className={styles.customerInfo}>
                        <span className={styles.customerName}>{order.customer_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.itemsList}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <span>{item.product_name}</span>
                            <span className={styles.itemQty}>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.totalCell}>
                        <span className={styles.totalAmount}>{formatCurrency(order.total_price)}</span>
                        {order.shipping_cost > 0 && (
                          <span className={styles.shippingCost}>+ {formatCurrency(order.shipping_cost)} shipping</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ 
                          background: `${PAYMENT_STATUS[order.payment_status]?.color}15`, 
                          color: PAYMENT_STATUS[order.payment_status]?.color 
                        }}
                      >
                        {PAYMENT_STATUS[order.payment_status]?.label}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={styles.statusSelect}
                        style={{
                          borderColor: ORDER_STATUS[order.status]?.color
                        }}
                      >
                        {Object.entries(ORDER_STATUS).map(([key, value]) => (
                          <option key={key} value={key}>{value.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.date}>{formatDate(order.order_date)}</td>
                    <td>
                      <button 
                        className={styles.viewBtn}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                      >
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
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
          onAddTracking={handleAddTracking}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onUpdatePayment, onAddTracking, formatCurrency, formatDate }) {
  const [activeTab, setActiveTab] = useState("details");
  const [trackingForm, setTrackingForm] = useState({
    courier_name: order.courier_name || "",
    tracking_number: order.tracking_number || "",
  });

  const handleSaveTracking = () => {
    if (trackingForm.courier_name && trackingForm.tracking_number) {
      onAddTracking(order.id, trackingForm);
    }
  };

  const canShip = order.status === "processing" || order.status === "paid";
  const canComplete = order.status === "shipped";
  const canCancel = ["pending", "paid", "processing"].includes(order.status);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Order {order.id}</h2>
            <p className={styles.modalSubtitle}>{formatDate(order.order_date)}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "details" ? styles.active : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Order Details
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "shipping" ? styles.active : ""}`}
            onClick={() => setActiveTab("shipping")}
          >
            Shipping
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "payment" ? styles.active : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            Payment
          </button>
        </div>

        <div className={styles.modalBody}>
          {activeTab === "details" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Customer Information</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span className={styles.infoLabel}>Name</span>
                    <span className={styles.infoValue}>{order.customer_name}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Shipping Address</h3>
                <p className={styles.address}>{order.shipping_address}</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Order Items</h3>
                <div className={styles.itemsTable}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.product_name}</span>
                        <span className={styles.itemVariant}>{item.variant}</span>
                      </div>
                      <span className={styles.itemQty}>x{item.quantity}</span>
                      <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  <div className={styles.itemRowTotal}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.total_price)}</span>
                  </div>
                  <div className={styles.itemRowTotal}>
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className={`${styles.itemRowTotal} ${styles.grandTotal}`}>
                    <span>Total</span>
                    <span>{formatCurrency(order.total_price + order.shipping_cost)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Order Status</h3>
                <div className={styles.statusActions}>
                  {order.status === "pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => onUpdateStatus(order.id, "paid")}
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Mark as Paid
                    </button>
                  )}
                  {(order.status === "paid" || order.status === "processing") && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => onUpdateStatus(order.id, "processing")}
                    >
                      <span className="material-symbols-outlined">manufacturing</span>
                      Process Order
                    </button>
                  )}
                  {canComplete && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => onUpdateStatus(order.id, "completed")}
                    >
                      <span className="material-symbols-outlined">done_all</span>
                      Complete Order
                    </button>
                  )}
                  {canCancel && (
                    <button 
                      className={`${styles.actionBtn} ${styles.cancelBtn}`}
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this order?")) {
                          onUpdateStatus(order.id, "cancelled");
                        }
                      }}
                    >
                      <span className="material-symbols-outlined">cancel</span>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Shipping Information</h3>
                {order.tracking_number ? (
                  <div className={styles.trackingInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Courier</span>
                      <span className={styles.infoValue}>{order.courier_name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Tracking Number</span>
                      <span className={styles.infoValue}>{order.tracking_number}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Status</span>
                      <span className={styles.shippedStatus}>Shipped</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.trackingForm}>
                    <p className={styles.formHint}>Add tracking information to ship this order</p>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Courier Name</label>
                      <input
                        type="text"
                        value={trackingForm.courier_name}
                        onChange={(e) => setTrackingForm({...trackingForm, courier_name: e.target.value})}
                        className={styles.input}
                        placeholder="e.g., JNE, SiCepat, AnterAja"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tracking Number</label>
                      <input
                        type="text"
                        value={trackingForm.tracking_number}
                        onChange={(e) => setTrackingForm({...trackingForm, tracking_number: e.target.value})}
                        className={styles.input}
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <button 
                      className={styles.primaryBtn}
                      onClick={handleSaveTracking}
                      disabled={!canShip || !trackingForm.courier_name || !trackingForm.tracking_number}
                    >
                      <span className="material-symbols-outlined">local_shipping</span>
                      Ship Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Payment Information</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span className={styles.infoLabel}>Payment Method</span>
                    <span className={styles.infoValue}>{order.payment_method}</span>
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Payment Status</span>
                    <span 
                      className={styles.statusBadge}
                      style={{ 
                        background: `${PAYMENT_STATUS[order.payment_status]?.color}15`, 
                        color: PAYMENT_STATUS[order.payment_status]?.color,
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {PAYMENT_STATUS[order.payment_status]?.label}
                    </span>
                  </div>
                  <div>
                    <span className={styles.infoLabel}>Total Amount</span>
                    <span className={styles.infoValue}>{formatCurrency(order.total_price + order.shipping_cost)}</span>
                  </div>
                </div>
              </div>

              {order.payment_status === "pending" && (
                <div className={styles.paymentActions}>
                  <button 
                    className={styles.actionBtn}
                    onClick={() => onUpdatePayment(order.id, "success")}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirm Payment
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.cancelBtn}`}
                    onClick={() => onUpdatePayment(order.id, "failed")}
                  >
                    <span className="material-symbols-outlined">error</span>
                    Mark as Failed
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
