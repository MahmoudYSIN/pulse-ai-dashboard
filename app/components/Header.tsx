"use client";
import { motion } from "framer-motion";
import { Zap, MessageSquare, Mail, Activity } from "lucide-react";
import type { ActiveChannel } from "../types";

interface HeaderProps {
  activeChannel: ActiveChannel;
  onChannelChange: (channel: ActiveChannel) => void;
}

export default function Header({ activeChannel, onChannelChange }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel px-6 py-3.5 flex items-center justify-between sticky top-4 z-50 mx-4 gleam-border shadow-2xl"
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

      {/* Live System Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 glass-panel-sm px-4 py-2 border-white/20">
          <div className="dot-connected-gold" />
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-200/80 uppercase tracking-wider font-extrabold">
              Automation Engine
            </span>
            <span className="text-xs text-white font-bold flex items-center gap-1">
              n8n: <span className="text-emerald-300 font-extrabold">Connected</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 glass-panel-sm px-3 py-2 text-amber-300 border-white/20">
          <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-extrabold text-white">Live</span>
        </div>
      </div>
    </motion.header>
  );
}
