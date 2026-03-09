"use client";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      {children}
      <Footer />
    </AuthProvider>
  );
}
