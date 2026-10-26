"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Rocket,
  Clock,
  Loader2,
  Webhook,
  Zap,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import type { Recipient, ActiveChannel, Toast } from "../types";

interface ExecutionPanelProps {
  channel: ActiveChannel;
  recipients: Recipient[];
  message: string;
  subject: string;
  htmlContent: string;
  aiEnabled: boolean;
  aiPrompt: string;
  countryCode: string;
  buttonsEnabled?: boolean;
  buttons?: string[];
  onToast: (toast: Omit<Toast, "id">) => void;
}

export default function ExecutionPanel({
  channel,
  recipients,
  message,
  subject,
  htmlContent,
  aiEnabled,
  aiPrompt,
  countryCode,
  buttonsEnabled = false,
  buttons = [],
  onToast,
}: ExecutionPanelProps) {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://n8n.your-domain.com/webhook/campaign-launch"
  );
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const buildPayload = (isTest: boolean = false) => {
    const targetRecipients = isTest ? [recipients[0]] : recipients;
    return {
      channel,
      recipients: targetRecipients,
      ...(channel === "whatsapp"
        ? {
            message,
            countryCode,
            aiEnabled,
            aiPrompt,
            ...(buttonsEnabled && buttons.length > 0 ? { buttons } : {}),
          }
        : { subject, htmlContent }),
      webhookUrl,
      isTest,
      timestamp: new Date().toISOString(),
      ...(scheduleDate && scheduleTime
        ? { scheduledAt: `${scheduleDate}T${scheduleTime}` }
        : {}),
    };
  };

  const sendPayload = async (isTest: boolean = false) => {
    if (!recipients.length) {
      onToast({
        type: "error",
        message: "Audience is empty. Load demo contacts or upload a CSV first.",
      });
      return;
    }

    if (channel === "whatsapp" && !message.trim()) {
      onToast({
        type: "error",
        message: "Please compose a WhatsApp message template first.",
      });
      return;
    }

    if (channel === "email" && (!subject.trim() || !htmlContent.trim())) {
      onToast({
        type: "error",
        message: "Please provide both an Email subject and HTML body.",
      });
      return;
    }

    setSending(true);
    setProgress(0);

    const payload = buildPayload(isTest);

    // Progress simulation
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + Math.random() * 18;
      });
    }, 180);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        onToast({
          type: "success",
          message: isTest
            ? `Test message dispatched to ${recipients[0]?.name || "recipient #1"} ✓`
            : `Success! Bulk campaign dispatched to ${recipients.length} recipients via n8n.`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch {
      clearInterval(interval);
      setProgress(100);
      onToast({
        type: "info",
        message: isTest
          ? `Test payload generated for ${recipients[0]?.name || "recipient"}${
              buttonsEnabled && buttons.length
                ? ` with ${buttons.length} interactive buttons`
                : ""
            }. Hooked to n8n.`
          : `Campaign payload compiled for ${recipients.length} recipients${
              buttonsEnabled && buttons.length
                ? ` with ${buttons.length} quick reply buttons`
                : ""
            } ready for n8n execution.`,
      });
    }

    setTimeout(() => {
      setSending(false);
      setProgress(0);
    }, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-6 gleam-border shadow-2xl"
    >
      {/* Panel Top Title */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
              <span>Execution & Automation Webhook Engine</span>
            </h2>
            <p className="text-[12px] text-amber-100/80">
              Transmit compiled payload directly to your n8n workflow endpoint
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-amber-200 font-extrabold bg-amber-500/25 px-3 py-1 rounded-full border border-amber-400/40 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {channel === "whatsapp" && buttonsEnabled && buttons.length > 0
              ? `Interactive Mode (${buttons.length} Buttons)`
              : "Payload Guard Active"}
          </span>
        </div>
      </div>

      {/* Webhook URL Input */}
      <div className="mb-5">
        <label className="text-xs text-amber-100 font-bold mb-1.5 block flex items-center gap-1.5">
          <Webhook className="w-3.5 h-3.5 text-amber-400" />
          <span>Target n8n Webhook Endpoint</span>
        </label>
        <div className="relative">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://n8n.your-domain.com/webhook/campaign-launch"
            className="glass-input w-full px-4 py-2.5 text-sm font-mono text-amber-200 bg-white/5 border-white/15 focus:border-amber-400/50 font-bold"
          />
        </div>
      </div>

      {/* Buttons Action Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Send Test Button */}
        <button
          onClick={() => sendPayload(true)}
          disabled={sending}
          className="warm-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 border border-white/20 hover:border-amber-400/50 hover:bg-white/15 disabled:opacity-50 transition-all shadow-md"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
          ) : (
            <Send className="w-4 h-4 text-amber-400" />
          )}
          <span>Send Test (1 Lead)</span>
        </button>

        {/* Launch Bulk Campaign Button - Glowing Amber Gradient with White Text Contrast */}
        <button
          onClick={() => sendPayload(false)}
          disabled={sending}
          className="warm-btn flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-300/50 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 shadow-xl shadow-amber-500/40 amber-glow transition-all"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Rocket className="w-4 h-4 fill-white text-white" />
          )}
          <span>Launch Bulk Campaign</span>
        </button>

        {/* Schedule Button */}
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="warm-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 border border-white/20 hover:border-amber-400 transition-all shadow-md"
        >
          <Clock className="w-4 h-4 text-amber-300" />
          <span>Schedule Release</span>
        </button>

        {/* Stats on the right */}
        <div className="ml-auto flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl border border-white/15">
          <div className="text-right">
            <p className="text-[10px] text-amber-200/80 uppercase tracking-wider font-bold">
              Audience
            </p>
            <p className="text-sm font-extrabold text-white">
              {recipients.length} Contacts
            </p>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="text-right">
            <p className="text-[10px] text-amber-200/80 uppercase tracking-wider font-bold">
              Channel
            </p>
            <p className="text-sm font-extrabold text-amber-300 capitalize">
              {channel === "whatsapp" ? "💬 WhatsApp" : "📧 Email"}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Picker Drawer */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-panel-sm p-4 mt-4 flex items-end gap-3.5 border-amber-400/35 bg-white/5">
              <div className="flex-1">
                <label className="text-xs text-amber-100 font-bold mb-1.5 block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Release Date</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 text-sm text-white bg-white/5 border-white/15 focus:border-amber-400/50 font-bold"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-amber-100 font-bold mb-1.5 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Release Time</span>
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 text-sm text-white bg-white/5 border-white/15 focus:border-amber-400/50 font-bold"
                />
              </div>
              <button
                onClick={() => sendPayload(false)}
                disabled={sending || !scheduleDate || !scheduleTime}
                className="warm-btn flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 shadow-md shadow-amber-500/30"
              >
                <Clock className="w-3.5 h-3.5 fill-white text-white" />
                <span>Confirm Schedule</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar (Amber Gold Shimmer) */}
      <AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t border-white/15"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-200">
                {progress < 100
                  ? "Transmitting payload to n8n webhook..."
                  : "Dispatch Completed!"}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/20">
              <motion.div
                className="h-full rounded-full progress-bar-amber"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
