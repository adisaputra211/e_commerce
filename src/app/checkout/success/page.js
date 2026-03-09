"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import styles from "../checkout.module.css";

function SuccessContent() {
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.successContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <span className="material-symbols-outlined">check</span>
            </div>
            <h1>Payment Successful!</h1>
            <p className={styles.orderNumber}>Order Number: {orderNumber}</p>
            <p className={styles.successMessage}>
              Thank you for your purchase! We've sent a confirmation email to your registered email address.
              Your order will be processed shortly.
            </p>
            <div className={styles.successActions}>
              <Link href="/listing" className={styles.btnPrimary}>
                <span className="material-symbols-outlined">shopping_bag</span>
                Continue Shopping
              </Link>
              <Link href="/" className={styles.btnSecondary}>
                <span className="material-symbols-outlined">home</span>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutSuccess() {
  return (
    <AuthProvider>
      <SuccessContent />
    </AuthProvider>
  );
}
