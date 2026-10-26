"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Smartphone,
  Monitor,
  MessageSquare,
  Mail,
  CheckCheck,
  User,
  Sparkles,
  Reply,
} from "lucide-react";
import type { Recipient, ActiveChannel, PreviewDevice } from "../types";

interface PreviewPanelProps {
  channel: ActiveChannel;
  message: string;
  subject: string;
  htmlContent: string;
  recipients: Recipient[];
  countryCode: string;
  buttonsEnabled?: boolean;
  buttons?: string[];
}

function replacePlaceholders(text: string, recipient: Recipient): string {
  if (!text) return "";
  let result = text;
  result = result.replace(/\{\{name\}\}/gi, recipient?.name || "Ahmed Al Rashid");
  result = result.replace(/\{\{company\}\}/gi, recipient?.company || "Emirates Holdings");
  result = result.replace(
    /\{\{project\}\}/gi,
    recipient?.project || "Skyline Palm Residences"
  );
  result = result.replace(
    /\{\{phone\}\}/gi,
    recipient?.phone || "501234567"
  );
  result = result.replace(
    /\{\{email\}\}/gi,
    recipient?.email || "ahmed.rashid@emiratesholding.ae"
  );
  return result;
}

export default function PreviewPanel({
  channel,
  message,
  subject,
  htmlContent,
  recipients,
  countryCode,
  buttonsEnabled = false,
  buttons = [],
}: PreviewPanelProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [timeStr, setTimeStr] = useState("2:41 PM");
  const [clickedReply, setClickedReply] = useState<string | null>(null);

  useEffect(() => {
    setTimeStr(
      new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, []);

  const sampleRecipient: Recipient = recipients[0] || {
    name: "Ahmed Al Rashid",
    phone: "501234567",
    email: "ahmed.rashid@emiratesholding.ae",
    company: "Emirates Holdings",
    project: "Skyline Palm Residences",
  };

  const previewMessage = replacePlaceholders(message, sampleRecipient);
  const previewSubject = replacePlaceholders(subject, sampleRecipient);
  const previewHtml = replacePlaceholders(htmlContent, sampleRecipient);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-bubble p-6 flex flex-col h-full gleam-border shadow-2xl relative"
    >
      {/* Warm Ambient Backlight Glow behind the preview bubble */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />

      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shadow-inner">
            <Eye className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight drop-shadow-sm">
                Live Glassmorphic Preview
              </h2>
              <span className="text-[10px] bg-amber-400/30 text-amber-200 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/45 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 fill-amber-300" />
                Real-Time Render
              </span>
            </div>
            <p className="text-[12px] text-amber-100/80">
              Interactive preview with dynamic recipient token hydration
            </p>
          </div>
        </div>

        {channel === "email" && (
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-lg transition-all ${
                device === "desktop"
                  ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 font-extrabold shadow-md shadow-amber-500/30"
                  : "text-white/80 hover:text-white"
              }`}
              title="Desktop viewport"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-lg transition-all ${
                device === "mobile"
                  ? "text-white bg-gradient-to-r from-amber-500 to-orange-500 font-extrabold shadow-md shadow-amber-500/30"
                  : "text-white/80 hover:text-white"
              }`}
              title="Mobile viewport"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Recipient Context Pill */}
      <div className="glass-panel-sm px-3.5 py-2 mb-3.5 flex items-center justify-between gap-2 border-white/20 bg-white/5 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-100/80 font-medium">Hydrated for:</span>
          <span className="text-xs text-white font-extrabold truncate">
            {sampleRecipient.name}
          </span>
          <span className="text-[11px] text-amber-200 hidden sm:inline truncate font-medium">
            ({sampleRecipient.company})
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-300 font-extrabold shrink-0 bg-white/10 px-2 py-0.5 rounded border border-white/20">
          {channel === "whatsapp"
            ? `${countryCode} ${sampleRecipient.phone}`
            : sampleRecipient.email}
        </span>
      </div>

      {/* Preview Viewport Container */}
      <div className="flex-1 overflow-hidden rounded-2xl relative z-10 border border-white/20 bg-white/[0.04] backdrop-blur-xl">
        {channel === "whatsapp" ? (
          /* WhatsApp Glass Chat View */
          <div className="h-full rounded-2xl overflow-hidden flex flex-col bg-white/[0.02]">
            {/* Top WhatsApp Glass Bar */}
            <div className="bg-white/10 px-4 py-3 flex items-center gap-3 border-b border-white/20 backdrop-blur-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 flex items-center justify-center text-white text-sm font-extrabold shadow-md">
                {sampleRecipient.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {sampleRecipient.name}
                </p>
                <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>online • WhatsApp Business</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-200/90 font-mono font-medium">
                  {countryCode} {sampleRecipient.phone}
                </span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {/* Date chip */}
              <div className="flex justify-center">
                <span className="text-[10px] bg-white/15 text-white px-3 py-1 rounded-full border border-white/20 font-bold shadow-sm">
                  TODAY
                </span>
              </div>

              {/* Outgoing Message Block (Bubble + Interactive Quick Reply Buttons) */}
              <div className="flex flex-col items-end gap-1.5">
                {/* Outgoing Message Bubble */}
                <div className="whatsapp-bubble-glass">
                  <p className="text-[13px] text-white whitespace-pre-wrap leading-relaxed font-medium">
                    {previewMessage || (
                      <span className="text-white/60 italic">
                        Type a message in the composer to view live preview...
                      </span>
                    )}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    <span className="text-[10px] text-emerald-100 font-mono font-bold">
                      {timeStr}
                    </span>
                    <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </div>

                {/* Simulated WhatsApp Interactive Action Buttons (Stacked beneath bubble) */}
                {buttonsEnabled && buttons && buttons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[86%] flex flex-col gap-1.5"
                  >
                    {buttons.map((btnLabel, idx) => (
                      <button
                        key={idx}
                        onClick={() => setClickedReply(btnLabel)}
                        className="warm-btn w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/25 backdrop-blur-xl text-center text-xs font-bold text-amber-200 flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                        title="Click to test simulated reply"
                      >
                        <Reply className="w-3 h-3 text-amber-400" />
                        <span>{btnLabel}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Incoming Simulated Reply (Dynamic based on clicked button or default) */}
              <AnimatePresence>
                <div className="flex justify-start">
                  <div className="whatsapp-bubble-glass-incoming">
                    <p className="text-[13px] text-white leading-relaxed font-medium">
                      {clickedReply ? (
                        <>
                          <span className="text-amber-300 font-bold block mb-1">
                            [{clickedReply}]
                          </span>
                          <span>
                            Thanks for your prompt response! Please share the unit options and booking procedures for{" "}
                            <strong className="text-amber-300 font-bold">
                              {sampleRecipient.project || "the project"}
                            </strong>
                            .
                          </span>
                        </>
                      ) : (
                        <>
                          Hello! Thanks for reaching out. Please send over the master brochure and VIP payment plan for{" "}
                          <strong className="text-amber-300 font-bold">
                            {sampleRecipient.project || "the project"}
                          </strong>
                          . 😊
                        </>
                      )}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      <span className="text-[10px] text-white/70 font-mono">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatePresence>
            </div>

            {/* Bottom Fake Input Bar */}
            <div className="bg-white/10 px-3.5 py-2.5 flex items-center gap-2.5 border-t border-white/15">
              <div className="flex-1 bg-white/10 rounded-full px-4 py-2 border border-white/20">
                <span className="text-xs text-white/70">
                  Type a WhatsApp reply...
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
            </div>
          </div>
        ) : (
          /* HTML Email View */
          <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-white/[0.02]">
            {/* Email Header Bar */}
            <div className="bg-white/10 px-4 py-3 border-b border-white/20 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white">
                    Rendered HTML Email
                  </span>
                </div>
                <span className="text-[10px] bg-amber-400/25 text-amber-200 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-wider">
                  {device === "desktop" ? "Desktop (600px)" : "Mobile (375px)"}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-200/80 w-14 font-bold">From:</span>
                  <span className="text-white/95 font-mono text-[11px]">
                    Pulse AI Campaigns &lt;vip@pulse-marketing.io&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-200/80 w-14 font-bold">To:</span>
                  <span className="text-amber-300 font-extrabold">
                    {sampleRecipient.name} &lt;{sampleRecipient.email}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-200/80 w-14 font-bold">Subject:</span>
                  <span className="text-white font-extrabold">
                    {previewSubject || "No subject provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Iframe Viewport (Translucent Glass Override) */}
            <div
              className={`flex-1 overflow-y-auto bg-white/[0.03] flex justify-center p-3 sm:p-5 transition-all ${
                device === "mobile" ? "px-6" : ""
              }`}
            >
              <div
                className={`w-full transition-all duration-300 ${
                  device === "mobile" ? "max-w-[375px]" : "max-w-[650px]"
                }`}
              >
                {previewHtml ? (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full min-h-[460px] border-0 rounded-xl bg-white shadow-2xl"
                    title="Live HTML Email Sandbox"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[220px]">
                    <p className="text-sm text-white/70">
                      Select a template or input HTML to preview...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
