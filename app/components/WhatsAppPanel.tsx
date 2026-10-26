"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  ChevronDown,
  Globe,
  Tag,
  Flame,
  MousePointerClick,
  Plus,
  Trash2,
  ListPlus,
} from "lucide-react";
import { COUNTRY_CODES } from "../types";

interface WhatsAppPanelProps {
  message: string;
  onMessageChange: (msg: string) => void;
  aiEnabled: boolean;
  onAiToggle: (v: boolean) => void;
  aiPrompt: string;
  onAiPromptChange: (v: string) => void;
  countryCode: string;
  onCountryCodeChange: (v: string) => void;
  buttonsEnabled: boolean;
  onButtonsEnabledChange: (v: boolean) => void;
  buttons: string[];
  onButtonsChange: (btns: string[]) => void;
}

const PRESET_BUTTONS = [
  { label: "Arabic Real Estate", buttons: ["مهتم 🌟", "غير مهتم 🙏"] },
  {
    label: "VIP English Actions",
    buttons: ["Book Viewing 🏛️", "Request Pricing 📊", "Call Me 📞"],
  },
  {
    label: "Direct Consultation",
    buttons: ["نعم، أرسل التفاصيل 📄", "تحدث مع مستشار 🤝"],
  },
];

export default function WhatsAppPanel({
  message,
  onMessageChange,
  aiEnabled,
  onAiToggle,
  aiPrompt,
  onAiPromptChange,
  countryCode,
  onCountryCodeChange,
  buttonsEnabled,
  onButtonsEnabledChange,
  buttons,
  onButtonsChange,
}: WhatsAppPanelProps) {
  const [showCodes, setShowCodes] = useState(false);

  const placeholders = [
    { tag: "{{name}}", label: "Name" },
    { tag: "{{company}}", label: "Company" },
    { tag: "{{project}}", label: "Project" },
    { tag: "{{phone}}", label: "Phone" },
    { tag: "{{email}}", label: "Email" },
  ];

  const insertPlaceholder = (tag: string) => {
    onMessageChange(message + tag);
  };

  const currentCode =
    COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const updateButtonText = (index: number, text: string) => {
    const updated = [...buttons];
    updated[index] = text;
    onButtonsChange(updated);
  };

  const removeButton = (index: number) => {
    const updated = buttons.filter((_, i) => i !== index);
    onButtonsChange(updated);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      onButtonsChange([...buttons, `Quick Action ${buttons.length + 1}`]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 space-y-5 gleam-border h-full flex flex-col justify-between shadow-2xl"
    >
      <div className="space-y-5">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
                <span>WhatsApp Campaign Panel</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </h2>
              <p className="text-[12px] text-amber-100/80">
                Direct WhatsApp outreach with dynamic tags & interactive quick replies
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-amber-200 bg-amber-500/25 border border-amber-400/40 px-3 py-1 rounded-full shadow-sm">
            Cloud API Active
          </span>
        </div>

        {/* Target Country Code Selector */}
        <div>
          <label className="text-xs text-amber-100 font-bold mb-1.5 block flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Region & Country Code</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCodes(!showCodes)}
              className="glass-input w-full px-4 py-2.5 text-sm flex items-center justify-between text-white font-bold bg-white/5 border-white/15 focus:border-amber-400/50"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{currentCode.flag}</span>
                <span className="text-amber-300 font-mono font-bold">
                  {currentCode.code}
                </span>
                <span className="text-white font-medium">
                  ({currentCode.country})
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-amber-300 transition-transform ${
                  showCodes ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCodes && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-30 mt-1.5 w-full glass-bubble rounded-xl overflow-hidden max-h-[220px] overflow-y-auto p-1.5 border border-white/30 shadow-2xl bg-[#2a1d17] backdrop-blur-2xl"
              >
                {COUNTRY_CODES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCountryCodeChange(c.code);
                      setShowCodes(false);
                    }}
                    className={`w-full px-3.5 py-2 text-sm text-left rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2.5 ${
                      c.code === countryCode
                        ? "text-amber-300 bg-amber-500/30 font-extrabold"
                        : "text-white font-medium"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span className="font-mono text-xs font-bold">{c.code}</span>
                    <span className="text-amber-200/80 text-xs ml-auto">
                      {c.country}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Message Template Composer */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-amber-100 font-bold">
              WhatsApp Message Body
            </label>
            <span className="text-[11px] text-amber-300 font-mono font-extrabold">
              {message.length} chars
            </span>
          </div>

          {/* Variable tags shortcuts */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {placeholders.map((p) => (
              <button
                key={p.tag}
                onClick={() => insertPlaceholder(p.tag)}
                className="warm-btn flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/25 text-amber-100 border border-amber-400/40 hover:border-amber-300 hover:bg-amber-500/35 transition-all"
              >
                <Tag className="w-3 h-3 text-amber-400" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Hi {{name}}, I'm reaching out from {{company}} regarding {{project}}..."
            rows={5}
            className="glass-input w-full px-4 py-3 text-sm resize-none leading-relaxed bg-white/5 border-white/15 focus:border-amber-400/50 text-white placeholder-slate-400 font-medium"
          />
        </div>

        {/* Interactive Buttons (Quick Reply) Section */}
        <div className="glass-panel-sm p-4 space-y-3.5 border-amber-400/40 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/40">
                <MousePointerClick className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">
                    Interactive Buttons (Quick Reply)
                  </span>
                  <span className="text-[10px] font-extrabold bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/50">
                    Max 3
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/80">
                  Clickable action buttons rendered beneath message
                </p>
              </div>
            </div>

            {/* Glowing Amber/Orange Toggle Switch */}
            <button
              onClick={() => onButtonsEnabledChange(!buttonsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
                buttonsEnabled
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300/70 shadow-lg shadow-amber-500/40"
                  : "bg-white/15 border-white/20"
              }`}
            >
              <motion.div
                animate={{ x: buttonsEnabled ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {buttonsEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 pt-2.5 border-t border-white/20"
            >
              {/* Presets Chips */}
              <div>
                <span className="text-[11px] font-bold text-amber-200 block mb-1.5">
                  1-Click Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_BUTTONS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => onButtonsChange([...preset.buttons])}
                      className="warm-btn text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1"
                    >
                      <ListPlus className="w-3 h-3 text-amber-400" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Button Inputs List */}
              <div className="space-y-2">
                {buttons.map((btn, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs font-mono font-bold text-amber-300">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={btn}
                      maxLength={25}
                      onChange={(e) => updateButtonText(idx, e.target.value)}
                      placeholder={`Button ${idx + 1} text (e.g. مهتم 🌟)`}
                      className="glass-input flex-1 px-3.5 py-1.5 text-xs bg-white/5 border-white/15 focus:border-amber-400/50 text-white font-bold"
                    />
                    <button
                      onClick={() => removeButton(idx)}
                      className="p-1.5 text-white/50 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                      title="Remove button"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Button Trigger (Up to 3) */}
              {buttons.length < 3 && (
                <button
                  onClick={addButton}
                  className="warm-btn w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-100 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add Button Label ({buttons.length}/3)</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Personalization Box */}
      <div className="glass-panel-sm p-4.5 space-y-3 border-amber-400/40 bg-white/5 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/40">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white">
                  Gemini AI Personalization
                </span>
                <span className="text-[10px] font-bold bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/45">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-amber-100/80">
                Rewrites every message based on recipient project interest
              </p>
            </div>
          </div>

          {/* Glowing Amber/Orange Toggle Switch */}
          <button
            onClick={() => onAiToggle(!aiEnabled)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
              aiEnabled
                ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300/70 shadow-lg shadow-amber-500/40"
                : "bg-white/15 border-white/20"
            }`}
          >
            <motion.div
              animate={{ x: aiEnabled ? 26 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            />
          </button>
        </div>

        {aiEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="pt-2.5 border-t border-white/20"
          >
            <label className="text-xs text-amber-200 mb-1.5 block font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Gemini AI Prompt Instructions</span>
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder="Keep tone polite, executive, concise, and tailor based on project interest..."
              rows={2}
              className="glass-input w-full px-3.5 py-2 text-xs resize-none bg-white/5 border-white/15 focus:border-amber-400/50 text-white placeholder-slate-400 font-medium"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
