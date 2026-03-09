"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    try {
      const storedUser = localStorage.getItem("shopx_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate user data before setting
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {
          // Invalid data, clear it
          localStorage.removeItem("shopx_user");
        }
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      localStorage.removeItem("shopx_user");
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("shopx_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("shopx_user");
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("shopx_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
