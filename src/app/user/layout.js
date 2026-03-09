"use client";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";

export default function UserLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}
