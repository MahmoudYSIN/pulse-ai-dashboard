"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "marketing" | "admin" | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (pin: string) => { success: boolean; role?: UserRole; error?: string };
  logout: () => void;
  openAdminElevate: () => void;
  closeAdminElevate: () => void;
  isAdminElevateOpen: boolean;
  elevateToAdmin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  isAuthenticated: false,
  login: () => ({ success: false }),
  logout: () => {},
  openAdminElevate: () => {},
  closeAdminElevate: () => {},
  isAdminElevateOpen: false,
  elevateToAdmin: () => false,
});

export const MARKETING_PIN = process.env.NEXT_PUBLIC_MARKETING_PIN || "1010";
export const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2026";
const AUTH_STORAGE_KEY = "pulse_auth_session_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdminElevateOpen, setIsAdminElevateOpen] = useState(false);

  // Load session from localStorage & cookie on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === "admin" || stored === "marketing") {
        setRole(stored as UserRole);
        document.cookie = `pulse_role=${stored}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = useCallback((pin: string) => {
    const trimmed = pin.trim();
    if (trimmed === ADMIN_PIN) {
      setRole("admin");
      localStorage.setItem(AUTH_STORAGE_KEY, "admin");
      document.cookie = "pulse_role=admin; path=/; max-age=604800; SameSite=Lax";
      return { success: true, role: "admin" as UserRole };
    } else if (trimmed === MARKETING_PIN) {
      setRole("marketing");
      localStorage.setItem(AUTH_STORAGE_KEY, "marketing");
      document.cookie = "pulse_role=marketing; path=/; max-age=604800; SameSite=Lax";
      return { success: true, role: "marketing" as UserRole };
    }
    return { success: false, error: "Invalid access PIN. Please check and try again." };
  }, []);

  const elevateToAdmin = useCallback((pin: string) => {
    if (pin.trim() === ADMIN_PIN) {
      setRole("admin");
      localStorage.setItem(AUTH_STORAGE_KEY, "admin");
      document.cookie = "pulse_role=admin; path=/; max-age=604800; SameSite=Lax";
      setIsAdminElevateOpen(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = "pulse_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  }, []);

  const openAdminElevate = useCallback(() => setIsAdminElevateOpen(true), []);
  const closeAdminElevate = useCallback(() => setIsAdminElevateOpen(false), []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0907] text-white">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated: !!role,
        login,
        logout,
        openAdminElevate,
        closeAdminElevate,
        isAdminElevateOpen,
        elevateToAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
