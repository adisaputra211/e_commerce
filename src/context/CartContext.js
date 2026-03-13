"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Listen for storage events from other tabs/pages
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        try {
          setCartItems(JSON.parse(e.newValue || "[]"));
        } catch (err) {
          console.error("Failed to parse cart from storage event:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addToCart = useCallback((product, options = {}) => {
    const { color, storage, quantity = 1 } = options;

    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.color?.name === color?.name &&
          item.storage === storage
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + quantity,
        };
        return updated;
      } else {
        // Add new item
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || null,
          image: product.image,
          category: product.category,
          color: color || null,
          storage: storage || null,
          quantity,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  }, []);

  const updateQuantity = (id, newQuantity, options = {}) => {
    const { color, storage } = options;
    
    setCartItems((prev) =>
      prev.map((item) => {
        const isMatch =
          item.id === id &&
          (!color || item.color?.name === color.name) &&
          (!storage || item.storage === storage);
        return isMatch ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const removeItem = (id, options = {}) => {
    const { color, storage } = options;
    
    setCartItems((prev) =>
      prev.filter((item) => {
        const isMatch =
          item.id === id &&
          (!color || item.color?.name === color.name) &&
          (!storage || item.storage === storage);
        return !isMatch;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartItem = (productId, options = {}) => {
    const { color, storage } = options;
    return cartItems.find(
      (item) =>
        item.id === productId &&
        (!color || item.color?.name === color.name) &&
        (!storage || item.storage === storage)
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartCount,
        getCartItem,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
