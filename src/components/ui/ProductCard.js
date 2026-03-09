import Link from "next/link";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="product-card-link">
      <div className="product-card">
        <div className="product-image-wrapper">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
          {product.discount && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-pricing">
            <span className="product-price">
              {formatIDR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="product-original-price">
                {formatIDR(product.originalPrice)}
              </span>
            )}
          </div>
          <button className="add-to-cart-btn">
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
