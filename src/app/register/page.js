"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after registration
        login({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
        });
        router.push("/user/dashboard");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
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
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        {/* Left Side - Branding */}
        <div className={styles.registerBrand}>
          <div className={styles.brandContent}>
            <div className={styles.brandLogo}>
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <h1 className={styles.brandTitle}>ShopX</h1>
            <p className={styles.brandSubtitle}>
              Join Our Community Today
            </p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>Shop Latest Products</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">favorite</span>
                <span>Save Your Favorites</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">tracking_changes</span>
                <span>Track Your Orders</span>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">rewards</span>
                <span>Exclusive Rewards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className={styles.registerFormWrapper}>
          <div className={styles.registerForm}>
            <Link href="/login" className={styles.backLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Login
            </Link>

            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>
                Fill in the details to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.input}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
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

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={styles.input}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <p className={styles.loginLink}>
              Already have an account?{" "}
              <Link href="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
