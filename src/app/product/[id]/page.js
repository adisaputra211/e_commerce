"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
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
      { label: "Rear Camera", key: "camera" },
      { label: "Front Camera", key: "frontCamera" },
      { label: "Battery", key: "battery" },
      { label: "OS", key: "os" },
      { label: "Network", key: "network" },
    ],
  },
  tablet: {
    title: "Tablet Specifications",
    specs: [
      { label: "Display", key: "display" },
      { label: "Processor", key: "processor" },
      { label: "RAM", key: "ram" },
      { label: "Storage", key: "storage" },
      { label: "Rear Camera", key: "camera" },
      { label: "Front Camera", key: "frontCamera" },
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

// Default empty values (used when product has no data)
const emptySpecs = {
  display: "",
  processor: "",
  ram: "",
  storage: "",
  camera: "",
  frontCamera: "",
  battery: "",
  os: "",
  network: "",
  graphics: "",
  weight: "",
};

const defaultColors = [];
const defaultStorageOptions = [];

function ProductContent() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState("512GB");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [mainImage, setMainImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Get product ID and ensure it's a number
  const productId = params.id ? parseInt(params.id) : null;

  // Fetch product from database
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching product with ID:', productId);
        const response = await fetch(`/api/products/${productId}`);
        console.log('Response status:', response.status);
        
        if (response.status === 404) {
          console.error(`Product with ID ${productId} not found in database`);
          setProduct(null);
        } else if (response.ok) {
          const data = await response.json();
          console.log('Product data:', data);
          setProduct(data);
        } else {
          console.error('Failed to fetch product, status:', response.status);
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Use product's own colors and storage options if available, otherwise use defaults
  const productColors = product?.colors && product.colors.length > 0 ? product.colors : defaultColors;
  const productStorageOptions = product?.storageOptions && product.storageOptions.length > 0 ? product.storageOptions : defaultStorageOptions;

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.notFound}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading product...</p>
          </div>
        </div>
      </>
    );
  }

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
  const specs = emptySpecs;

  const handleAddToCart = () => {
    setIsAddingToCart(true);

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    };

    const options = {
      color: productColors[selectedColor],
      storage: selectedStorage,
      quantity,
    };

    addToCart(cartItem, options);

    // Navigate to cart page after a short delay
    setTimeout(() => {
      router.push("/cart");
    }, 300);
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
      color: productColors[selectedColor],
      storage: selectedStorage,
      quantity,
    };
    router.push(`/checkout?data=${encodeURIComponent(JSON.stringify(checkoutData))}`);
  };

  // Use product images array, or fallback to single image
  const thumbnailImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

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
              {thumbnailImages.slice(0, 4).map((img, idx) => {
                const isLastVisible = idx === 3 && thumbnailImages.length > 4;
                const moreCount = thumbnailImages.length - 4;

                return (
                  <button
                    key={idx}
                    className={`${styles.thumbnail} ${mainImage === idx ? styles.thumbnailActive : ""}`}
                    onClick={() => setMainImage(idx)}
                    style={{ position: 'relative' }}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                    {isLastVisible && (
                      <div className={styles.thumbnailOverlay}>
                        <span>+{moreCount + 1} more</span>
                      </div>
                    )}
                  </button>
                );
              })}
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
                Color: <span>{productColors[selectedColor]?.name}</span>
              </h3>
              <div className={styles.colorOptions}>
                {productColors.map((color, idx) => (
                  <button
                    key={color.name}
                    className={`${styles.colorBtn} ${selectedColor === idx ? styles.colorBtnActive : ""
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
                {productStorageOptions.map((storage) => (
                  <button
                    key={storage}
                    className={`${styles.storageBtn} ${selectedStorage === storage ? styles.storageBtnActive : ""
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
                  {product?.description || `The ${product.name.split(" - ")[0]} is more than the next big step in mobile tech. With the highest camera resolution on a smartphone and stunning Night Mode powered by Nightography, you can share those big moments no matter the lighting. Plus, with the fastest processor yet, juggle high-intensity games, multiple apps or video calls with ease.`}
                </p>
                {product?.specifications && (
                  <ul>
                    {product.specifications.display && (
                      <li>Display: {product.specifications.display}</li>
                    )}
                    {product.specifications.processor && (
                      <li>Processor: {product.specifications.processor}</li>
                    )}
                    {product.specifications.ram && (
                      <li>RAM: {product.specifications.ram}</li>
                    )}
                    {product.specifications.camera && (
                      <li>Rear Camera: {product.specifications.camera}</li>
                    )}
                    {product.specifications.frontCamera && (
                      <li>Front Camera: {product.specifications.frontCamera}</li>
                    )}
                    {product.specifications.battery && (
                      <li>Battery: {product.specifications.battery}</li>
                    )}
                  </ul>
                )}
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
                        <td className={styles.specValue}>
                          {product?.specifications?.[spec.key] || specs[spec.key]}
                        </td>
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
