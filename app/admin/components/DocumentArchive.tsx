"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  Download,
  Edit3,
  Send,
  Search,
  FileText,
  Stamp,
  PenTool,
  Calendar,
  Trash2,
  Eye,
  X,
  ExternalLink,
  MessageSquare,
  Mail,
} from "lucide-react";
import type { ArchivedDocument } from "../types";
import { N8N_WEBHOOK_URL } from "../data";

interface DocumentArchiveProps {
  documents: ArchivedDocument[];
  onDocumentsChange: (docs: ArchivedDocument[]) => void;
  onReEdit: (doc: ArchivedDocument) => void;
}

export default function DocumentArchive({
  documents,
  onDocumentsChange,
  onReEdit,
}: DocumentArchiveProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewingDoc, setViewingDoc] = useState<ArchivedDocument | null>(null);
  const [sendStatus, setSendStatus] = useState<Record<string, string>>({});

  const filtered = documents.filter((d) => {
    const matchesSearch =
      !search ||
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.templateType.toLowerCase().includes(search.toLowerCase()) ||
      d.amountOrProperty.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === "all" || d.templateId === filterType;
    return matchesSearch && matchesType;
  });

  const templateTypes = [
    ...new Set(documents.map((d) => d.templateId)),
  ];

  const handleDownload = (doc: ArchivedDocument) => {
    if (!doc.pdfBase64) return;
    const a = document.createElement("a");
    a.href = doc.pdfBase64;
    a.download = `${doc.templateId}-${doc.clientName
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;
    a.click();
  };

  const handleSendVia = async (
    doc: ArchivedDocument,
    channel: "whatsapp" | "email"
  ) => {
    setSendStatus({ ...sendStatus, [doc.id]: "sending" });
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "document_send",
          channel,
          document_id: doc.id,
          template_type: doc.templateType,
          client_name: doc.clientName,
          amount: doc.amountOrProperty,
          generated_at: doc.generationDate,
          has_stamp: doc.stampIncluded,
          has_signature: doc.signatureIncluded,
        }),
        mode: "no-cors",
      });
      setSendStatus({ ...sendStatus, [doc.id]: "sent" });
      setTimeout(() => {
        setSendStatus((prev) => {
          const next = { ...prev };
          delete next[doc.id];
          return next;
        });
      }, 3000);
    } catch {
      setSendStatus({ ...sendStatus, [doc.id]: "sent" });
      setTimeout(() => {
        setSendStatus((prev) => {
          const next = { ...prev };
          delete next[doc.id];
          return next;
        });
      }, 3000);
    }
  };

  const handleDelete = (id: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="glass-panel p-4 gleam-border flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-9 pr-4 py-2.5 text-xs rounded-xl w-60"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-input px-3 py-2.5 text-xs rounded-xl appearance-none cursor-pointer"
          >
            <option value="all">All Templates</option>
            <option value="marketing-approval">Marketing Approval</option>
            <option value="payment-voucher">Payment Voucher</option>
            <option value="receipt-general">General Receipt</option>
            <option value="tenancy-contract">Tenancy Contract</option>
          </select>
          <span className="text-xs text-white/50 font-medium">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Document Table */}
      <div className="glass-panel gleam-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Document ID
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Client / Party
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Amount / Property
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Generated
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Stamps
                </th>
                <th className="px-4 py-3 text-right text-white/70 font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] text-white/50">
                      {doc.id.slice(0, 12)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-200 border border-amber-400/20 text-[11px] font-bold">
                      {doc.templateType.replace("Citiway ", "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {doc.clientName}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {doc.amountOrProperty || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-white/30" />
                      {new Date(doc.generationDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {doc.stampIncluded && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20 text-[10px] font-bold">
                          <Stamp className="w-2.5 h-2.5" /> Stamp
                        </span>
                      )}
                      {doc.signatureIncluded && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-300 border border-emerald-400/20 text-[10px] font-bold">
                          <PenTool className="w-2.5 h-2.5" /> Signed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {doc.pdfBase64 && (
                        <>
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-amber-300 hover:bg-white/10 transition-all"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-blue-300 hover:bg-white/10 transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onReEdit(doc)}
                        className="p-1.5 rounded-lg text-white/50 hover:text-amber-300 hover:bg-white/10 transition-all"
                        title="Re-edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative group/send">
                        <button
                          className={`p-1.5 rounded-lg transition-all ${
                            sendStatus[doc.id] === "sent"
                              ? "text-emerald-400"
                              : sendStatus[doc.id] === "sending"
                              ? "text-amber-300 animate-pulse"
                              : "text-white/50 hover:text-emerald-300 hover:bg-white/10"
                          }`}
                          title="Send via..."
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute right-0 bottom-full mb-1 hidden group-hover/send:flex flex-col gap-1 p-2 glass-panel rounded-xl border border-white/15 shadow-xl z-20 min-w-[140px]">
                          <button
                            onClick={() => handleSendVia(doc, "whatsapp")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/80 hover:bg-white/10 transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleSendVia(doc, "email")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/80 hover:bg-white/10 transition-all"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            Email
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Archive className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">
                      {documents.length === 0
                        ? "No documents archived yet"
                        : "No documents match your filter"}
                    </p>
                    <p className="text-[10px] text-white/25 mt-1">
                      Generate documents from the PDF Prefill Engine
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setViewingDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-panel p-6 gleam-border max-w-4xl max-h-[85vh] w-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  {viewingDoc.templateType} — {viewingDoc.clientName}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(viewingDoc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                  <button
                    onClick={() => setViewingDoc(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {viewingDoc.pdfBase64 ? (
                  <iframe
                    src={viewingDoc.pdfBase64}
                    className="w-full h-[70vh]"
                    title="Document Preview"
                  />
                ) : (
                  <div className="p-8 text-center text-white/40">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No PDF data available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
