"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, KeyRound, ArrowRight, AlertCircle, Sparkles, CheckCircle2, Building2 } from "lucide-react";
import { useAuth, MARKETING_PIN, ADMIN_PIN } from "./AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated, login, isAdminElevateOpen, closeAdminElevate, elevateToAdmin } = useAuth();
  const [pin, setPin] = useState("");
  const [elevatePin, setElevatePin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [elevateError, setElevateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin) {
      setError("Please enter an access PIN");
      return;
    }
    setIsSubmitting(true);
    const res = login(pin);
    if (!res.success) {
      setError(res.error || "Invalid PIN. Try 1010 or 2026");
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleElevate = (e: React.FormEvent) => {
    e.preventDefault();
    setElevateError(null);
    const success = elevateToAdmin(elevatePin);
    if (!success) {
      setElevateError("Invalid Admin PIN. Please enter code 2026.");
    } else {
      setElevatePin("");
    }
  };

  // 1. If not authenticated, render Login Modal Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0c0a09] selection:bg-amber-500/30 selection:text-amber-200">
        {/* Warm Ambient Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.35)_0%,transparent_60%)] blur-[90px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.25)_0%,transparent_65%)] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md glass-panel p-8 gleam-border shadow-2xl rounded-3xl"
        >
          {/* Header Brand */}
          <div className="text-center mb-7">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30 border border-amber-300/40">
              <Lock className="w-8 h-8 text-white fill-white/10" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <span>Citiway</span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Pulse AI
              </span>
            </h2>
            <p className="text-xs text-white/60 mt-1.5 font-medium">
              Dual-Role Protected Workspace • Enter Access Code
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-amber-200/90 mb-2 block tracking-wider uppercase flex items-center justify-between">
                <span>Access PIN Code</span>
                <span className="text-white/40 normal-case font-normal text-[10px]">
                  4 Digits
                </span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  maxLength={8}
                  placeholder="Enter PIN (e.g. 1010 or 2026)"
                  className="glass-input w-full pl-11 pr-4 py-3.5 text-center text-lg tracking-[0.3em] font-extrabold text-amber-200 placeholder:text-white/20 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs rounded-xl focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 font-medium"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="warm-btn w-full py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 border border-amber-300/60 shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Authenticate & Enter</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick PIN Info Cards */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setPin(MARKETING_PIN); setError(null); }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px] mb-1">
                <span>🟢</span>
                <span>Marketing</span>
              </div>
              <p className="text-[10px] text-white/50">Code: <strong className="text-white">1010</strong></p>
              <p className="text-[9px] text-white/30 mt-0.5">Campaign Hub only</p>
            </button>

            <button
              type="button"
              onClick={() => { setPin(ADMIN_PIN); setError(null); }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px] mb-1">
                <span>👑</span>
                <span>Admin CRM</span>
              </div>
              <p className="text-[10px] text-white/50">Code: <strong className="text-white">2026</strong></p>
              <p className="text-[9px] text-white/30 mt-0.5">Full System Access</p>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Authenticated: Render children + Elevation Modal if opened
  return (
    <>
      {children}

      {/* Admin Elevation Modal */}
      <AnimatePresence>
        {isAdminElevateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel p-6 gleam-border shadow-2xl rounded-2xl relative"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Shield className="w-6 h-6 text-slate-950 fill-slate-950" />
                </div>
                <h3 className="text-lg font-bold text-white">Restricted Area</h3>
                <p className="text-xs text-white/60 mt-1">
                  Access to Developer Tracker & PDF Generator requires <strong className="text-amber-300">Admin PIN (2026)</strong>.
                </p>
              </div>

              <form onSubmit={handleElevate} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={elevatePin}
                    onChange={(e) => {
                      setElevatePin(e.target.value);
                      if (elevateError) setElevateError(null);
                    }}
                    autoFocus
                    placeholder="Enter Admin PIN (2026)"
                    className="glass-input w-full px-4 py-3 text-center text-lg font-bold tracking-widest text-amber-300"
                  />
                </div>

                {elevateError && (
                  <p className="text-xs text-rose-400 font-medium text-center">
                    {elevateError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeAdminElevate}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 border border-amber-300/40"
                  >
                    Unlock Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
