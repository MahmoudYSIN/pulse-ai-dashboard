"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { Toast } from "../types";

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />,
  info: <Info className="w-5 h-5 text-amber-300 shrink-0" />,
};

const borderMap = {
  success: "border-emerald-400/40 shadow-emerald-500/20",
  error: "border-rose-400/40 shadow-rose-500/20",
  info: "border-amber-400/40 shadow-amber-500/20",
};

export default function ToastNotification({
  toasts,
  onDismiss,
}: ToastNotificationProps) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className={`glass-panel-sm flex items-center gap-3 px-4 py-3.5 min-w-[320px] max-w-[420px] border shadow-2xl backdrop-blur-2xl bg-[#281e18]/90 ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <span className="text-xs font-bold text-white flex-1 leading-relaxed">
              {toast.message}
            </span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
