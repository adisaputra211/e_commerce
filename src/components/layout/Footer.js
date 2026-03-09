import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span className="material-symbols-outlined logo-icon">shopping_bag</span>
              <span className="logo-text">ShopX</span>
            </Link>
            <p className="footer-description">
              Your one-stop destination for all your shopping needs. Best prices,
              guaranteed quality.
            </p>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Track Order</Link></li>
              <li><Link href="#">Returns &amp; Refunds</Link></li>
              <li><Link href="#">Contact Us</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="footer-section">
            <h4 className="footer-heading">About ShopX</h4>
            <ul className="footer-links">
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h4 className="footer-heading">Subscribe to our Newsletter</h4>
            <p className="footer-newsletter-text">
              Get the latest updates on new products and upcoming sales.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">© 2024 ShopX. All rights reserved.</p>
          <div className="footer-social">
            <Link href="#" className="social-link">
              <span className="material-symbols-outlined">language</span>
            </Link>
            <Link href="#" className="social-link">
              <span className="material-symbols-outlined">share</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
