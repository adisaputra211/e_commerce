"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { products } from "@/data/products";
import styles from "./product.module.css";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Product specifications data
const productSpecs = {
  hp: {
    title: "Smartphone Specifications",
    specs: [
      { label: "Display", key: "display" },
      { label: "Processor", key: "processor" },
      { label: "RAM", key: "ram" },
      { label: "Storage", key: "storage" },
      { label: "Camera", key: "camera" },
      { label: "Battery", key: "battery" },
      { label: "OS", key: "os" },
      { label: "5G", key: "network" },
    ],
  },
  tablet: {
    title: "Tablet Specifications",
    specs: [
      { label: "Display", key: "display" },
      { label: "Processor", key: "processor" },
      { label: "RAM", key: "ram" },
      { label: "Storage", key: "storage" },
      { label: "Camera", key: "camera" },
      { label: "Battery", key: "battery" },
      { label: "OS", key: "os" },
    ],
  },
  laptop: {
    title: "Laptop Specifications",
    specs: [
      { label: "Display", key: "display" },
      { label: "Processor", key: "processor" },
      { label: "RAM", key: "ram" },
      { label: "Storage", key: "storage" },
      { label: "Graphics", key: "graphics" },
      { label: "Battery", key: "battery" },
      { label: "OS", key: "os" },
      { label: "Weight", key: "weight" },
    ],
  },
};

// Sample detailed specs for products
const detailedSpecs = {
  hp: {
    display: '6.8" Dynamic AMOLED 2X, 120Hz',
    processor: "Snapdragon 8 Gen 2",
    ram: "12GB",
    storage: "256GB / 512GB / 1TB",
    camera: "200MP + 12MP + 10MP + 10MP",
    battery: "5000mAh, 45W Fast Charging",
    os: "Android 13, One UI 5.1",
    network: "5G Enabled",
    graphics: "Adreno 740",
    weight: "234g",
  },
  tablet: {
    display: '12.9" Liquid Retina XDR, 120Hz',
    processor: "Apple M2 Chip",
    ram: "8GB",
    storage: "128GB / 256GB / 512GB / 1TB",
    camera: "12MP Wide + 10MP Ultra Wide",
    battery: "10090mAh, 20W Fast Charging",
    os: "iPadOS 17",
    weight: "682g",
  },
  laptop: {
    display: '14.2" Liquid Retina XDR, 120Hz',
    processor: "Apple M3 Pro",
    ram: "18GB Unified Memory",
    storage: "512GB SSD",
    camera: "1080p FaceTime HD",
    battery: "Up to 18 hours",
    os: "macOS Sonoma",
    weight: "1.61 kg",
    graphics: "18-core GPU",
  },
};

const colors = [
  { name: "Phantom Black", value: "#1a1a2e" },
  { name: "Arctic Silver", value: "#e8e8e8" },
  { name: "Forest Green", value: "#2d5016" },
  { name: "Lavender", value: "#e6d5f5" },
];

const storageOptions = ["256GB", "512GB", "1TB"];

function ProductContent() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id);

  const product = products.find((p) => p.id === productId);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState("512GB");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [mainImage, setMainImage] = useState(0);

  if (!product) {
    return (
      <>
        <Header />
        <div className={styles.notFound}>
          <h1>Product Not Found</h1>
          <Link href="/listing">Browse Products</Link>
        </div>
      </>
    );
  }

  const categorySpecs = productSpecs[product.category] || productSpecs.hp;
  const specs = detailedSpecs[product.category] || detailedSpecs.hp;

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log("Added to cart:", {
      product,
      color: colors[selectedColor],
      storage: selectedStorage,
      quantity,
    });
  };

  const handleBuyNow = () => {
    // Navigate to checkout with product data
    const checkoutData = {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      color: colors[selectedColor],
      storage: selectedStorage,
      quantity,
    };
    router.push(`/checkout?data=${encodeURIComponent(JSON.stringify(checkoutData))}`);
  };

  const thumbnailImages = [
    product.image,
    product.image,
    product.image,
    product.image,
    product.image,
    product.image,
  ];

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <Link href="/listing" className={styles.breadcrumbLink}>
            Electronics
          </Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <Link
            href={`/listing?category=${product.category}`}
            className={styles.breadcrumbLink}
          >
            {product.category === "hp"
              ? "Smartphones"
              : product.category === "tablet"
              ? "Tablets"
              : "Laptops"}
          </Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className={styles.breadcrumbCurrent}>
            {product.name.split(" - ")[0]}
          </span>
        </nav>

        {/* Product Detail Card */}
        <div className={styles.productCard}>
          {/* Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img src={thumbnailImages[mainImage]} alt={product.name} />
              {product.discount && (
                <span className={styles.discountBadge}>
                  {product.discount}% OFF
                </span>
              )}
            </div>
            <div className={styles.thumbnails}>
              {thumbnailImages.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumbnail} ${
                    mainImage === idx ? styles.thumbnailActive : ""
                  }`}
                  onClick={() => setMainImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
              <button className={styles.moreImages}>
                <span>+{thumbnailImages.length - 4} more</span>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <div className={styles.titleRow}>
              <h1 className={styles.productTitle}>{product.name}</h1>
            </div>

            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  {formatIDR(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className={styles.originalPrice}>
                      {formatIDR(product.originalPrice)}
                    </span>
                    <span className={styles.saveBadge}>
                      Hemat {formatIDR(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              <p className={styles.priceNote}>Harga sudah termasuk semua pajak.</p>
            </div>

            {/* Color Selection */}
            <div className={styles.variantSection}>
              <h3 className={styles.variantLabel}>
                Color: <span>{colors[selectedColor].name}</span>
              </h3>
              <div className={styles.colorOptions}>
                {colors.map((color, idx) => (
                  <button
                    key={color.name}
                    className={`${styles.colorBtn} ${
                      selectedColor === idx ? styles.colorBtnActive : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(idx)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Storage Selection */}
            <div className={styles.variantSection}>
              <h3 className={styles.variantLabel}>Storage:</h3>
              <div className={styles.storageOptions}>
                {storageOptions.map((storage) => (
                  <button
                    key={storage}
                    className={`${styles.storageBtn} ${
                      selectedStorage === storage ? styles.storageBtnActive : ""
                    }`}
                    onClick={() => setSelectedStorage(storage)}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className={styles.actionSection}>
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className={styles.actionButtons}>
                <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  Add to Cart
                </button>
                <button className={styles.buyNowBtn} onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className={styles.deliveryInfo}>
              <div className={styles.deliveryItem}>
                <span className="material-symbols-outlined">local_shipping</span>
                <div>
                  <h4>Free Delivery</h4>
                  <p>Enter your postal code for Delivery Availability</p>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <span className="material-symbols-outlined">assignment_return</span>
                <div>
                  <h4>Return Delivery</h4>
                  <p>Free 30 Days Delivery Returns. Details</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className={styles.tabsCard}>
          <div className={styles.tabsHeader}>
            <button
              className={`${styles.tab} ${activeTab === "description" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`${styles.tab} ${activeTab === "specifications" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("specifications")}
            >
              Specifications
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "description" && (
              <div className={styles.descriptionTab}>
                <h3>Product Overview</h3>
                <p>
                  The {product.name.split(" - ")[0]} is more than the next big step in mobile tech.
                  With the highest camera resolution on a smartphone and stunning Night Mode
                  powered by Nightography, you can share those big moments no matter the lighting.
                  Plus, with the fastest processor yet, juggle high-intensity games, multiple apps
                  or video calls with ease.
                </p>
                <ul>
                  <li>Capture the night with clear, bright photos and videos thanks to the advanced camera and Nightography.</li>
                  <li>Smooth gaming and streaming with the powerful processor.</li>
                  <li>Long-lasting battery to keep you powered throughout the day.</li>
                  <li>Stunning display with high refresh rate for smooth visuals.</li>
                  <li>Premium build quality with durable materials.</li>
                </ul>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className={styles.specificationsTab}>
                <h3>{categorySpecs.title}</h3>
                <table className={styles.specTable}>
                  <tbody>
                    {categorySpecs.specs.map((spec) => (
                      <tr key={spec.key}>
                        <td className={styles.specLabel}>{spec.label}</td>
                        <td className={styles.specValue}>{specs[spec.key]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProductDetailPage() {
  return (
    <AuthProvider>
      <ProductContent />
    </AuthProvider>
  );
}
