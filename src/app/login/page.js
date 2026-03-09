"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Don't auto redirect - let user choose
      // If you want to redirect, uncomment below:
      // router.push("/");
    }
  }, [isAuthenticated, authLoading]);

  const handleClearStorage = () => {
    localStorage.removeItem("shopx_user");
    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        router.push(data.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* Left Side - Branding */}
        <div className={styles.loginBrand}>
          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <h1 className={styles.brandTitle}>ShopX</h1>
            <p className={styles.brandSubtitle}>
              Your One-Stop E-Commerce Destination
            </p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">verified</span>
                <span>Authentic Products</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">local_shipping</span>
                <span>Free Shipping</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">security</span>
                <span>Secure Payment</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">support_agent</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.loginFormWrapper}>
          <div className={styles.loginForm}>
            <Link href="/" className={styles.backLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Home
            </Link>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Welcome Back!</h2>
              <p className={styles.formSubtitle}>
                Sign in to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={styles.input}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" name="remember" />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotLink}>
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <p className={styles.signupLink}>
              Don&apos;t have an account?{" "}
              <Link href="/register">Sign up</Link>
            </p>

            <button
              type="button"
              className={styles.clearStorageBtn}
              onClick={handleClearStorage}
            >
              <span className="material-symbols-outlined">delete</span>
              Clear Stored Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
