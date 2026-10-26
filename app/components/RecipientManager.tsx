"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  Users,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Recipient } from "../types";

export const DEMO_CONTACTS: Recipient[] = [
  {
    name: "Ahmed Al Rashid",
    phone: "501234567",
    email: "ahmed.rashid@emiratesholding.ae",
    company: "Emirates Holdings",
    project: "Skyline Palm Residences",
  },
  {
    name: "Sarah Jenkins",
    phone: "529876543",
    email: "s.jenkins@apexglobal.com",
    company: "Apex Global Partners",
    project: "Downtown Canal Heights",
  },
  {
    name: "Tariq Mansoor",
    phone: "554567890",
    email: "tariq@innovateuae.com",
    company: "Innovate UAE",
    project: "Marina Bay Luxury Villa",
  },
  {
    name: "Elena Rostova",
    phone: "583210987",
    email: "elena.r@investdubai.io",
    company: "Invest Dubai Capital",
    project: "Dubai Creek Water Views",
  },
  {
    name: "Fatima Al Zaabi",
    phone: "508882345",
    email: "fatima@citiway.ae",
    company: "Citiway Properties",
    project: "Business Bay Elite Tower",
  },
];

interface RecipientManagerProps {
  recipients: Recipient[];
  onRecipientsChange: (r: Recipient[]) => void;
}

export default function RecipientManager({
  recipients,
  onRecipientsChange,
}: RecipientManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [detectedCols, setDetectedCols] = useState<string[]>([
    "Name",
    "Phone",
    "Email",
    "Company",
    "Project",
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const normalizeKey = (key: string): string => {
    const k = key.toLowerCase().trim();
    if (k.includes("name") || k.includes("full")) return "name";
    if (k.includes("phone") || k.includes("mobile") || k.includes("whatsapp"))
      return "phone";
    if (k.includes("email") || k.includes("mail")) return "email";
    if (k.includes("company") || k.includes("org")) return "company";
    if (k.includes("project")) return "project";
    return k;
  };

  const processData = useCallback(
    (rawData: Record<string, string>[]) => {
      if (!rawData.length) return;
      const cols = Object.keys(rawData[0]);
      setDetectedCols(cols);

      const mapped: Recipient[] = rawData.map((row) => {
        const rec: Record<string, string> = {
          name: "",
          phone: "",
          email: "",
          company: "",
          project: "",
        };
        for (const col of cols) {
          const normalKey = normalizeKey(col);
          rec[normalKey] = (row[col] || "").toString().trim();
        }
        return rec as unknown as Recipient;
      });

      onRecipientsChange(mapped.filter((r) => r.name || r.phone || r.email));
    },
    [onRecipientsChange]
  );

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "csv" || ext === "txt") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            processData(result.data as Record<string, string>[]);
          },
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
          processData(json);
        };
        reader.readAsArrayBuffer(file);
      }
    },
    [processData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const loadDemoContacts = () => {
    setDetectedCols(["Name", "Phone", "Email", "Company", "Project"]);
    onRecipientsChange(DEMO_CONTACTS);
  };

  const filteredRecipients = recipients.filter((r) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.company?.toLowerCase().includes(q) ||
      r.project?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-panel p-6 gleam-border shadow-2xl"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
            <Users className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-white tracking-tight drop-shadow-sm">
                Recipient Management
              </h2>
              {recipients.length > 0 && (
                <span className="bg-amber-400/25 text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-amber-400/40 shadow-sm">
                  {recipients.length} Contacts Active
                </span>
              )}
            </div>
            <p className="text-[12px] text-amber-100/80">
              Shared cross-channel audience with auto column normalization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDemoContacts}
            className="warm-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-md shadow-amber-500/30"
            title="Load 5 realistic test recipients"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Load Demo Leads</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-3.5"
          >
            {/* Upload Zone */}
            {recipients.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`drag-zone-warm rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging ? "drag-active" : ""
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center mb-3 shadow-md shadow-amber-500/30"
                >
                  <Upload className="w-6 h-6 text-amber-300" />
                </motion.div>
                <p className="text-sm font-extrabold text-white mb-1">
                  Drag & drop CSV or Excel file here, or{" "}
                  <span className="text-amber-300 underline underline-offset-2">browse files</span>
                </p>
                <p className="text-xs text-amber-100/80 text-center max-w-md font-medium">
                  Auto-detects: Name, Phone, Email, Company, Project. Or click{" "}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      loadDemoContacts();
                    }}
                    className="text-amber-300 underline font-extrabold hover:text-white"
                  >
                    Load Demo Leads
                  </span>{" "}
                  to test immediately with sample contacts.
                </p>
              </div>
            ) : (
              <>
                {/* Column Mapping & Actions */}
                <div className="flex items-center justify-between gap-3 flex-wrap bg-white/5 p-2.5 rounded-xl border border-white/15">
                  {detectedCols.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-xs text-amber-100/90 font-bold">
                        Normalized Attributes:
                      </span>
                      {detectedCols.map((col) => (
                        <span
                          key={col}
                          className="text-[11px] bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-md border border-amber-400/30 font-extrabold"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="warm-btn glass-panel-sm px-3.5 py-1.5 text-xs font-extrabold text-amber-200 border-amber-400/30 hover:border-amber-400/60 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import New File
                    </button>
                    <button
                      onClick={() => onRecipientsChange([])}
                      className="warm-btn glass-panel-sm px-3.5 py-1.5 text-xs font-extrabold text-rose-300 border-rose-500/30 hover:border-rose-400 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Audience
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300/80" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email, company, or project interest..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="glass-input w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border-white/15 focus:border-amber-400/50 text-white placeholder-slate-400"
                  />
                  {filter && (
                    <button
                      onClick={() => setFilter("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Recipient Data Table (Overridden Translucent White Glass) */}
                <div className="rounded-xl overflow-hidden border border-white/20 bg-white/5">
                  <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/10 border-b border-white/20 text-[11px] font-extrabold text-white uppercase tracking-wider">
                          <th className="text-left px-4 py-3">#</th>
                          <th className="text-left px-4 py-3">Name</th>
                          <th className="text-left px-4 py-3">WhatsApp Number</th>
                          <th className="text-left px-4 py-3">Email Address</th>
                          <th className="text-left px-4 py-3">Company</th>
                          <th className="text-left px-4 py-3">Project Interest</th>
                          <th className="px-3 py-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecipients.map((r, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="hover:bg-white/15 border-b border-white/10 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-amber-200/80 text-xs font-mono font-bold">
                              {i + 1}
                            </td>
                            <td className="px-4 py-2.5 text-white font-extrabold">
                              {r.name}
                            </td>
                            <td className="px-4 py-2.5 text-amber-300 font-mono text-xs font-bold">
                              {r.phone}
                            </td>
                            <td className="px-4 py-2.5 text-white text-xs font-medium">
                              {r.email}
                            </td>
                            <td className="px-4 py-2.5 text-amber-100 text-xs font-medium">
                              {r.company}
                            </td>
                            <td className="px-4 py-2.5 text-amber-200 text-xs font-bold">
                              {r.project || "—"}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => {
                                  const updated = [...recipients];
                                  updated.splice(recipients.indexOf(r), 1);
                                  onRecipientsChange(updated);
                                }}
                                className="text-white/50 hover:text-rose-400 transition-colors p-1"
                                title="Remove recipient"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredRecipients.length > 0 && (
                    <div className="px-4 py-2.5 text-xs text-amber-100/90 bg-white/5 border-t border-white/10 flex items-center justify-between font-bold">
                      <span>Showing {filteredRecipients.length} qualified contacts</span>
                      <span className="text-[11px] text-amber-300 font-extrabold">
                        Synced across WhatsApp & Email engines
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
