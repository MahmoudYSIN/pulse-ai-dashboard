"use client";

import { motion } from "framer-motion";
import { Zap, MessageSquare, Mail, Activity, Shield, LogOut, ExternalLink, Lock } from "lucide-react";
import type { ActiveChannel } from "../types";
import { useAuth } from "./AuthContext";

interface HeaderProps {
  activeChannel: ActiveChannel;
  onChannelChange: (channel: ActiveChannel) => void;
}

export default function Header({ activeChannel, onChannelChange }: HeaderProps) {
  const { role, logout, openAdminElevate } = useAuth();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel px-6 py-3.5 flex items-center justify-between sticky top-4 z-50 mx-4 gleam-border shadow-2xl flex-wrap gap-4"
    >
      {/* Brand & Hub Title */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1c1512] shadow-sm shadow-emerald-400/90 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow-sm">
              <span>Pulse AI</span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Marketing Hub
              </span>
            </h1>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-sm">
              Warm Glass V2
            </span>
          </div>
          <p className="text-[11px] text-amber-100/80 tracking-wide font-medium">
            Multi-Channel Campaign Automation • WhatsApp & HTML Email
          </p>
        </div>
      </div>

      {/* Multi-Channel Switcher Tabs */}
      <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-md">
        <button
          onClick={() => onChannelChange("whatsapp")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all duration-300 ${
            activeChannel === "whatsapp"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold shadow-lg shadow-amber-500/30 border border-amber-300/50"
              : "text-white/90 hover:text-white hover:bg-white/10 font-bold"
          }`}
        >
          <MessageSquare
            className={`w-4 h-4 ${
              activeChannel === "whatsapp" ? "text-white fill-white/20" : "text-amber-300"
            }`}
          />
          <span>💬 WhatsApp Campaign</span>
        </button>

        <button
          onClick={() => onChannelChange("email")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all duration-300 ${
            activeChannel === "email"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold shadow-lg shadow-amber-500/30 border border-amber-300/50"
              : "text-white/90 hover:text-white hover:bg-white/10 font-bold"
          }`}
        >
          <Mail
            className={`w-4 h-4 ${
              activeChannel === "email" ? "text-white fill-white/20" : "text-amber-300"
            }`}
          />
          <span>📧 HTML Email</span>
        </button>
      </div>

      {/* Right Controls: Role Badge, Admin CRM Link, and Lock/Logout */}
      <div className="flex items-center gap-3">
        {/* Admin Navigation link (Only shown for Admin role) */}
        {role === "admin" && (
          <a
            href="/admin"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30 hover:text-white transition-all shadow-md shadow-amber-500/10"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin CRM</span>
          </a>
        )}

        {/* If Marketing role, show locked button that triggers elevation */}
        {role === "marketing" && (
          <button
            onClick={openAdminElevate}
            title="Unlock Admin CRM with Admin PIN (2026)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80 transition-all cursor-pointer"
          >
            <Lock className="w-3 h-3 text-amber-400/70" />
            <span>Admin CRM</span>
          </button>
        )}

        {/* Active Session Role Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border backdrop-blur-md transition-all shadow-sm">
          {role === "admin" ? (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/15 border-amber-400/30 px-2.5 py-1 rounded-lg border">
              <span>👑</span>
              <span>Admin Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border-emerald-400/30 px-2.5 py-1 rounded-lg border">
              <span>🟢</span>
              <span>Marketing Mode</span>
            </div>
          )}
        </div>

        {/* Lock / Logout Button */}
        <button
          onClick={logout}
          title="Lock & Exit Workspace"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-rose-500/20 hover:text-rose-200 hover:border-rose-400/30 transition-all cursor-pointer group"
        >
          <LogOut className="w-3.5 h-3.5 text-white/50 group-hover:text-rose-300 transition-colors" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </motion.header>
  );
}
