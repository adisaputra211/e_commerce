"use client";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
