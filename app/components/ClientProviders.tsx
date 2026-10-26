"use client";

import React from "react";
import { AuthProvider } from "./AuthContext";
import AuthGuard from "./AuthGuard";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
