"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function RegisterLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
