"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import styles from "./cart.module.css";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

function CartContent() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const [localCartItems, setLocalCartItems] = useState([]);

  // Force read from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setLocalCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
        setLocalCartItems([]);
      }
    } else {
      setLocalCartItems([]);
    }
  }, []);

  // Use cartItems from context or fallback to localStorage
  const items = cartItems.length > 0 ? cartItems : localCartItems;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const savings = originalTotal - subtotal;
  const shipping = subtotal > 7500000 ? 0 : 225000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartContent}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link href="/listing" className={styles.continueShoppingBtn}>
              <span className="material-symbols-outlined">storefront</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.cartContainer}>
        <div className={styles.cartInner}>
          <h1 className={styles.pageTitle}>Shopping Cart</h1>
          <p className={styles.itemCount}>{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>

        <div className={styles.cartGrid}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                  {item.originalPrice && (
                    <span className={styles.discountBadge}>
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <p className={styles.itemCategory}>{item.category}</p>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id, { color: item.color, storage: item.storage })}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
                <div className={styles.itemQuantity}>
                  <label>Quantity:</label>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, { color: item.color, storage: item.storage })}
                      disabled={item.quantity <= 1}
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className={styles.quantityValue}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, { color: item.color, storage: item.storage })}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  {item.originalPrice && (
                    <span className={styles.originalPrice}>
                      {formatIDR(item.originalPrice)}
                    </span>
                  )}
                  <span className={styles.currentPrice}>
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className={`${styles.summaryRow} ${styles.savings}`}>
                  <span>You Save</span>
                  <span>-{formatIDR(savings)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "GRATIS" : formatIDR(shipping)}</span>
              </div>
              {shipping === 0 && (
                <p className={styles.freeShippingNote}>
                  <span className="material-symbols-outlined">local_shipping</span>
                  Gratis ongkir untuk pesanan di atas Rp 7.500.000
                </p>
              )}
              <div className={styles.summaryDivider}></div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
              <button className={styles.checkoutBtn}>
                <span className="material-symbols-outlined">security</span>
                Proceed to Checkout
              </button>
              <Link href="/listing" className={styles.continueShoppingLink}>
                <span className="material-symbols-outlined">arrow_back</span>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <AuthProvider>
      <CartContent />
    </AuthProvider>
  );
}
