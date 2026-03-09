import Link from "next/link";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import ProductCard from "@/components/ui/ProductCard";
import styles from "./page.module.css";

export default function Home() {
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
        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/listing?category=${cat.id}`}
              className={styles.categoryItem}
            >
              <div className={styles.categoryIcon}>
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryDesc}>{cat.description}</span>
            </Link>
          ))}
        </div>
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
        <div className={styles.productsGrid}>
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
