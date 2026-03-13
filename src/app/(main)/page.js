
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./page.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?active=true'),
          fetch('/api/categories'),
        ]);
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <img
          src="/hero-banner.png"
          alt="Electronics Sale Banner"
          className={styles.heroBannerBg}
        />
        <div className={styles.heroDecorations}>
          <div className={styles.heroDecCircle1}></div>
          <div className={styles.heroDecCircle2}></div>
          <div className={styles.heroDecCircle3}></div>
        </div>
        <div className={styles.heroBannerOverlay}>
          <div className={styles.heroBannerContent}>
            <span className={styles.heroBannerBadge}>Super Mega Sale</span>
            <h1 className={styles.heroBannerTitle}>
              Up to 70% Off
              <br />
              Top Electronics
            </h1>
            <p className={styles.heroBannerDesc}>
              Grab the best deals on smartphones, laptops, and accessories
              before they&apos;re gone!
            </p>
            <button className={styles.heroBannerCta}>Shop Now</button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
        </div>
        {categories.length === 0 ? (
          <div className={styles.emptyCategories}>
            <p>No categories available yet.</p>
          </div>
        ) : (
          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/listing?category=${cat.slug}`}
                className={styles.categoryItem}
              >
                <div className={styles.categoryIcon}>
                  <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryDesc}>{cat.description}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Products */}
      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className="material-symbols-outlined">thumb_up</span>
            Recommended for You
          </h2>
          <Link href="/listing" className={styles.seeAllLink}>
            See All{" "}
            <span className="material-symbols-outlined">chevron_right</span>
          </Link>
        </div>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyProducts}>
            <p>No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
