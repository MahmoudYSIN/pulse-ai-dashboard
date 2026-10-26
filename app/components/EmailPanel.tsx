"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Code,
  Eye,
  Type,
  Image,
  Link,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  Tag,
  LayoutTemplate,
  Palette,
} from "lucide-react";
import { EMAIL_TEMPLATES, type EditorMode } from "../types";

interface EmailPanelProps {
  subject: string;
  onSubjectChange: (s: string) => void;
  htmlContent: string;
  onHtmlContentChange: (h: string) => void;
  editorMode: EditorMode;
  onEditorModeChange: (m: EditorMode) => void;
}

export default function EmailPanel({
  subject,
  onSubjectChange,
  htmlContent,
  onHtmlContentChange,
  editorMode,
  onEditorModeChange,
}: EmailPanelProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const placeholders = [
    { tag: "{{name}}", label: "Name" },
    { tag: "{{company}}", label: "Company" },
    { tag: "{{project}}", label: "Project" },
    { tag: "{{email}}", label: "Email" },
  ];

  const insertImageURL = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      onHtmlContentChange(
        htmlContent +
          `\n<img src="${url}" alt="Image" style="max-width:100%;border-radius:12px;margin:20px 0;" />\n`
      );
    }
  };

  const insertCTA = () => {
    const text = prompt("Button text:", "View Exclusive Inventory");
    const url = prompt("Button URL:", "https://");
    if (text && url) {
      onHtmlContentChange(
        htmlContent +
          `\n<div style="text-align:center;margin:30px 0;"><a href="${url}" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;padding:15px 42px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 8px 24px rgba(245,158,11,0.35);">${text}</a></div>\n`
      );
    }
  };

  const insertLink = () => {
    const text = prompt("Link text:");
    const url = prompt("Link URL:", "https://");
    if (text && url) {
      onHtmlContentChange(
        htmlContent + `<a href="${url}" style="color:#f59e0b;font-weight:600;text-decoration:underline;">${text}</a>`
      );
    }
  };

  const wrapSelection = (before: string, after: string) => {
    onHtmlContentChange(htmlContent + `${before}text${after}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 space-y-5 gleam-border h-full flex flex-col justify-between shadow-2xl"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <Mail className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
                <span>HTML Email & Newsletter Studio</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </h2>
              <p className="text-[12px] text-amber-100/80">
                Responsive email templates with visual & raw HTML capabilities
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => onEditorModeChange("visual")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                editorMode === "visual"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
                  : "text-white/85 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual</span>
            </button>
            <button
              onClick={() => onEditorModeChange("html")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                editorMode === "html"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30"
                  : "text-white/85 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* Subject Line Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-amber-100 font-bold">
              Email Subject Line
            </label>
            <div className="flex items-center gap-1.5">
              {placeholders.map((p) => (
                <button
                  key={p.tag}
                  onClick={() => onSubjectChange(subject + p.tag)}
                  className="warm-btn flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/25 text-amber-100 border border-amber-400/40 hover:border-amber-300"
                >
                  <Tag className="w-2.5 h-2.5 text-amber-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Exclusive VIP Invitation: {{project}} Launch"
            className="glass-input w-full px-4 py-2.5 text-sm font-semibold text-white bg-white/5 border-white/15 focus:border-amber-400/50 placeholder-slate-400"
          />
        </div>

        {/* Ready-Made Newsletter Templates Picker */}
        <div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="warm-btn flex items-center justify-between glass-panel-sm px-4 py-2.5 text-xs font-extrabold w-full border border-amber-400/40 hover:border-amber-300 rounded-xl transition-all text-amber-100 bg-white/5"
          >
            <span className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-amber-400" />
              <span className="text-white">Choose Ready-Made Newsletter Templates</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-200/90 font-medium">
              <span>Browse 3 styles</span>
              <Palette className="w-3.5 h-3.5 text-amber-400" />
            </span>
          </button>

          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/20 backdrop-blur-xl"
            >
              {Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => {
                    onHtmlContentChange(tpl.html);
                    onSubjectChange(tpl.subject);
                    setShowTemplates(false);
                  }}
                  className="warm-btn glass-panel-sm p-3.5 text-left rounded-xl border border-white/20 hover:border-amber-400/60 transition-all group bg-white/5"
                >
                  <span className="text-xs font-extrabold block mb-1 text-white group-hover:text-amber-300 transition-colors">
                    {tpl.name}
                  </span>
                  <span className="text-[11px] text-amber-100/80 line-clamp-2 leading-relaxed font-medium">
                    {tpl.subject}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Visual Formatting Toolbar */}
        {editorMode === "visual" && (
          <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-white/5 border border-white/15">
            <button
              onClick={() => wrapSelection("<strong>", "</strong>")}
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => wrapSelection("<em>", "</em>")}
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => wrapSelection("<u>", "</u>")}
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={() =>
                wrapSelection('<p style="text-align:left;">', "</p>")
              }
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                wrapSelection('<p style="text-align:center;">', "</p>")
              }
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => wrapSelection("<ul><li>", "</li></ul>")}
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              title="List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={insertImageURL}
              className="warm-btn flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-white/5 border border-white/15 hover:border-amber-400 transition-all"
            >
              <Image className="w-3 h-3 text-amber-400" />
              <span>Image</span>
            </button>
            <button
              onClick={insertLink}
              className="warm-btn flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-white/5 border border-white/15 hover:border-amber-400 transition-all"
            >
              <Link className="w-3 h-3 text-amber-400" />
              <span>Link</span>
            </button>
            <button
              onClick={insertCTA}
              className="warm-btn flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 border border-amber-300/40 hover:from-amber-400 transition-all ml-auto shadow-md shadow-amber-500/30"
            >
              <Type className="w-3 h-3 fill-white" />
              <span>Insert Gold CTA</span>
            </button>
          </div>
        )}

        {/* Editor Area (Translucent White Glass) */}
        <div>
          <textarea
            value={htmlContent}
            onChange={(e) => onHtmlContentChange(e.target.value)}
            placeholder="Type email body or select a template above..."
            rows={10}
            className={`glass-input w-full px-4 py-3 text-sm resize-none leading-relaxed bg-white/5 border-white/15 focus:border-amber-400/50 text-white placeholder-slate-400 font-medium ${
              editorMode === "html"
                ? "font-mono text-xs text-amber-200"
                : ""
            }`}
            spellCheck={editorMode !== "html"}
          />
        </div>
      </div>
    </motion.div>
  );
}
