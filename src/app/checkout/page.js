"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import styles from "./checkout.module.css";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    address: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        setCheckoutData(parsed);
      } catch (e) {
        console.error("Error parsing checkout data:", e);
      }
    }
  }, [dataParam]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to success page
    router.push("/checkout/success");
    setIsProcessing(false);
  };

  if (!checkoutData) {
    return (
      <>
        <Header />
        <div className={styles.empty}>
          <span className="material-symbols-outlined">shopping_cart</span>
          <h2>No items to checkout</h2>
          <Link href="/listing" className={styles.backLink}>
            Browse Products
          </Link>
        </div>
      </>
    );
  }

  const { product, color, storage, quantity } = checkoutData;
  const subtotal = product.price * quantity;
  const shippingCost = 15000;
  const insurance = subtotal * 0.01;
  const total = subtotal + shippingCost + insurance;

  const provinces = [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "DI Yogyakarta",
    "Sumatera Utara",
    "Sumatera Barat",
    "Sulawesi Selatan",
    "Bali",
  ];

  const cities = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Barat", "Jakarta Utara"],
    "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor", "Cimahi"],
    "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Pekalongan"],
    "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Madiun"],
    "Banten": ["Tangerang", "Serang", "Cilegon", "Tangerang Selatan"],
    "DI Yogyakarta": ["Yogyakarta", "Sleman", "Bantul", "Gunung Kidul"],
    "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar"],
    "Sumatera Barat": ["Padang", "Bukittinggi", "Payakumbuh"],
    "Sulawesi Selatan": ["Makassar", "Parepare", "Palopo"],
    "Bali": ["Denpasar", "Singaraja", "Tabanan"],
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Left Column - Forms */}
          <div className={styles.leftColumn}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className="material-symbols-outlined">chevron_right</span>
              <Link href="/listing" className={styles.breadcrumbLink}>Electronics</Link>
              <span className="material-symbols-outlined">chevron_right</span>
              <span className={styles.breadcrumbCurrent}>Checkout</span>
            </nav>

            <h1 className={styles.pageTitle}>Checkout</h1>

            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className="material-symbols-outlined">location_on</span>
                  <h2 className={styles.sectionTitle}>Shipping Address</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      className={styles.input}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className={styles.input}
                      placeholder="08xx-xxxx-xxxx"
                      pattern="[0-9]{10,13}"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Province</label>
                    <select
                      name="province"
                      value={shippingAddress.province}
                      onChange={handleAddressChange}
                      className={styles.select}
                      required
                    >
                      <option value="">Select Province</option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <select
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className={styles.select}
                      disabled={!shippingAddress.province}
                      required
                    >
                      <option value="">Select City</option>
                      {shippingAddress.province &&
                        cities[shippingAddress.province]?.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>District</label>
                    <input
                      type="text"
                      name="district"
                      value={shippingAddress.district}
                      onChange={handleAddressChange}
                      className={styles.input}
                      placeholder="Enter your district"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                      className={styles.input}
                      placeholder="xxxxx"
                      pattern="[0-9]{5}"
                      required
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Complete Address</label>
                    <textarea
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                      className={styles.textarea}
                      placeholder="Street address, building, apartment, etc."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className="material-symbols-outlined">payment</span>
                  <h2 className={styles.sectionTitle}>Payment Method</h2>
                </div>

                <div className={styles.paymentOptions}>
                  {/* Bank Transfer */}
                  <label className={`${styles.paymentCard} ${paymentMethod === "bank" ? styles.paymentCardActive : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={styles.paymentRadio}
                      required
                    />
                    <div className={styles.paymentIcon}>
                      <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <h3 className={styles.paymentTitle}>Bank Transfer</h3>
                      <p className={styles.paymentDesc}>BCA, Mandiri, BNI, BRI</p>
                    </div>
                    <div className={styles.paymentCheck}>
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </label>

                  {/* E-Wallet */}
                  <label className={`${styles.paymentCard} ${paymentMethod === "ewallet" ? styles.paymentCardActive : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="ewallet"
                      checked={paymentMethod === "ewallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={styles.paymentRadio}
                    />
                    <div className={styles.paymentIcon}>
                      <span className="material-symbols-outlined">wallet</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <h3 className={styles.paymentTitle}>E-Wallet</h3>
                      <p className={styles.paymentDesc}>GoPay, OVO, Dana, ShopeePay</p>
                    </div>
                    <div className={styles.paymentCheck}>
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </label>

                  {/* Credit Card */}
                  <label className={`${styles.paymentCard} ${paymentMethod === "card" ? styles.paymentCardActive : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={styles.paymentRadio}
                    />
                    <div className={styles.paymentIcon}>
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <h3 className={styles.paymentTitle}>Credit/Debit Card</h3>
                      <p className={styles.paymentDesc}>Visa, Mastercard, JCB</p>
                    </div>
                    <div className={styles.paymentCheck}>
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </label>

                  {/* Retail */}
                  <label className={`${styles.paymentCard} ${paymentMethod === "retail" ? styles.paymentCardActive : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="retail"
                      checked={paymentMethod === "retail"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={styles.paymentRadio}
                    />
                    <div className={styles.paymentIcon}>
                      <span className="material-symbols-outlined">store</span>
                    </div>
                    <div className={styles.paymentInfo}>
                      <h3 className={styles.paymentTitle}>Retail Store</h3>
                      <p className={styles.paymentDesc}>Alfamart, Indomaret</p>
                    </div>
                    <div className={styles.paymentCheck}>
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className="material-symbols-outlined">note_alt</span>
                  <h2 className={styles.sectionTitle}>Order Notes (Optional)</h2>
                </div>
                <textarea
                  name="notes"
                  className={styles.textarea}
                  placeholder="Add any special instructions for your order..."
                  rows={2}
                />
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              {/* Product Item */}
              <div className={styles.summaryItem}>
                <div className={styles.itemImage}>
                  <img src={product.image} alt={product.name} />
                  {product.discount && (
                    <span className={styles.itemDiscount}>-{product.discount}%</span>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{product.name}</h3>
                  <div className={styles.itemVariants}>
                    <span className={styles.variantBadge}>Color: {color.name}</span>
                    <span className={styles.variantBadge}>Storage: {storage}</span>
                  </div>
                  <div className={styles.itemQuantity}>Qty: {quantity}</div>
                </div>
                <div className={styles.itemPrice}>
                  {formatIDR(product.price * quantity)}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Subtotal ({quantity} item{quantity > 1 ? "s" : ""})</span>
                  <span className={styles.priceValue}>{formatIDR(subtotal)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Shipping Cost</span>
                  <span className={styles.priceValue}>{formatIDR(shippingCost)}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Insurance (1%)</span>
                  <span className={styles.priceValue}>{formatIDR(insurance)}</span>
                </div>
                <div className={styles.priceDivider} />
                <div className={styles.priceRowTotal}>
                  <span className={styles.priceLabelTotal}>Total</span>
                  <span className={styles.priceValueTotal}>{formatIDR(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isProcessing || !paymentMethod}
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Place Order - {formatIDR(total)}
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className={styles.securityBadge}>
                <span className="material-symbols-outlined">security</span>
                <div>
                  <p className={styles.securityTitle}>Secure Transaction</p>
                  <p className={styles.securityDesc}>Your payment information is protected</p>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className={styles.supportCard}>
              <div className={styles.supportItem}>
                <span className="material-symbols-outlined">chat</span>
                <div>
                  <h4>Need Help?</h4>
                  <p>Chat with our support team</p>
                </div>
              </div>
              <div className={styles.supportItem}>
                <span className="material-symbols-outlined">phone</span>
                <div>
                  <h4>Call Us</h4>
                  <p>+62 21 1234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className={styles.loading}>
          <span className="material-symbols-outlined">progress_activity</span>
          <p>Loading checkout...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </AuthProvider>
  );
}
