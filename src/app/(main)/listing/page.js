"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { categories } from "@/data/categories";
import styles from "./listing.module.css";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

function ListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Fetch products from database
  useEffect(() => {
    async function fetchProducts() {
      try {
        const categoryQuery = categoryParam ? `&category=${categoryParam}` : '';
        const response = await fetch(`/api/products?active=true${categoryQuery}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam]);

  // Update category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory, products]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return b.id - a.id;
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSortBy("popularity");
    router.push("/listing");
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getCategoryCount = (categoryId) => {
    return products.filter((p) => p.category === categoryId).length;
  };

  // Pagination helper - get visible pages
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    const l = totalPages;

    for (let i = 1; i <= l; i++) {
      if (i === 1 || i === l || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (rangeWithDots.length > 0 && i - rangeWithDots[rangeWithDots.length - 1] > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (loading) {
    return (
      <div className={styles.listingContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listingContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.filterCard}>
          <div className={styles.filterHeader}>
            <span className="material-symbols-outlined">filter_list</span>
            <h3 className={styles.filterTitle}>Filters</h3>
          </div>

          {/* Categories */}
          <div className={styles.filterSection}>
            <h4 className={styles.sectionTitle}>Categories</h4>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                  className={styles.radio}
                />
                <span className={styles.radioText}>All Categories</span>
                <span className={styles.countBadge}>{products.length}</span>
              </label>
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={styles.radioLabel}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>{category.name}</span>
                  <span className={styles.countBadge}>{getCategoryCount(category.id)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button onClick={handleClearFilters} className={styles.clearFiltersBtn}>
            <span className="material-symbols-outlined">clear_all</span>
            Clear All Filters
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className="material-symbols-outlined">chevron_right</span>
          <Link href="/" className={styles.breadcrumbLink}>
            Electronics
          </Link>
          {selectedCategory && (
            <>
              <span className="material-symbols-outlined">chevron_right</span>
              <span className={styles.breadcrumbCurrent}>
                {getCategoryName(selectedCategory)}
              </span>
            </>
          )}
        </nav>

        {/* Header & Sorting */}
        <div className={styles.contentHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>
              {selectedCategory ? getCategoryName(selectedCategory) : "All Products"}
            </h1>
            <p className={styles.productCount}>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
          </div>
          <div className={styles.sortContainer}>
            <span className={styles.sortLabel}>Sort by:</span>
            <div className={styles.sortButtons}>
              <button
                className={`${styles.sortBtn} ${sortBy === "popularity" ? styles.sortBtnActive : ""}`}
                onClick={() => setSortBy("popularity")}
              >
                Popularity
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === "price" || sortBy === "price-desc" ? styles.sortBtnActive : ""}`}
                onClick={() => setSortBy(sortBy === "price" ? "price-desc" : "price")}
              >
                Price
              </button>
              <button
                className={`${styles.sortBtn} ${sortBy === "newest" ? styles.sortBtnActive : ""}`}
                onClick={() => setSortBy("newest")}
              >
                Newest
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className={styles.productGrid}>
          {paginatedProducts.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className={styles.productCardLink}>
              <div className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  {product.discount && (
                    <div className={styles.discountBadge}>
                      -{product.discount}%
                    </div>
                  )}
                  {product.rating === 5 && (
                    <div className={styles.newBadge}>New</div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productBrand}>
                    {product.name.split(" ")[0]}
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.pricing}>
                    <div className={styles.priceContainer}>
                      {product.originalPrice && (
                        <div className={styles.originalPrice}>
                          {formatIDR(product.originalPrice)}
                        </div>
                      )}
                      <div className={styles.currentPrice}>
                        {formatIDR(product.price)}
                      </div>
                    </div>
                    <button
                      className={styles.addToCartBtn}
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined">
                        add_shopping_cart
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <nav className={styles.pagination}>
              <button
                className={`${styles.paginationBtn} ${currentPage === 1 ? styles.paginationBtnDisabled : ""}`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {visiblePages.map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className={styles.paginationDots}>…</span>
                ) : (
                  <button
                    key={page}
                    className={`${styles.paginationPage} ${currentPage === page ? styles.paginationPageActive : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.paginationBtnDisabled : ""}`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingContent />
    </Suspense>
  );
}
