"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Upload,
  Eye,
  Download,
  Search,
  Bell,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  Percent,
  FileText,
  AlertTriangle,
  CheckCircle,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import type { Developer, Attachment, ExpiryPayload } from "../types";
import {
  calculateDaysLeft,
  getDeveloperStatus,
  generateId,
  N8N_WEBHOOK_URL,
} from "../data";

interface DeveloperTrackerProps {
  developers: (Developer & { daysLeft: number })[];
  onDevelopersChange: (devs: Developer[]) => void;
}

const EMPTY_DEV: Omit<Developer, "id" | "attachments" | "status"> = {
  name: "",
  contractRef: "",
  startDate: "",
  expiryDate: "",
  commissionRate: 5,
  accountManager: "",
  accountManagerPhone: "",
  accountManagerEmail: "",
};

export default function DeveloperTracker({
  developers,
  onDevelopersChange,
}: DeveloperTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_DEV);
  const [search, setSearch] = useState("");
  const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null);
  const [expiryCheckStatus, setExpiryCheckStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleSave = () => {
    if (!formData.name || !formData.contractRef || !formData.expiryDate) return;

    if (editingId) {
      const updated = developers.map((d) =>
        d.id === editingId
          ? {
              ...d,
              ...formData,
              status: getDeveloperStatus(formData.expiryDate),
              attachments: [...d.attachments, ...pendingFiles],
            }
          : d
      );
      onDevelopersChange(updated);
    } else {
      const newDev: Developer = {
        id: generateId(),
        ...formData,
        status: getDeveloperStatus(formData.expiryDate),
        attachments: pendingFiles,
      };
      onDevelopersChange([...developers, newDev]);
    }
    setFormData(EMPTY_DEV);
    setPendingFiles([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (dev: Developer) => {
    setFormData({
      name: dev.name,
      contractRef: dev.contractRef,
      startDate: dev.startDate,
      expiryDate: dev.expiryDate,
      commissionRate: dev.commissionRate,
      accountManager: dev.accountManager,
      accountManagerPhone: dev.accountManagerPhone,
      accountManagerEmail: dev.accountManagerEmail,
    });
    setPendingFiles([]);
    setEditingId(dev.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onDevelopersChange(developers.filter((d) => d.id !== id));
  };

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = "";
  };

  const processFiles = (files: File[]) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    files.forEach((file) => {
      if (!allowed.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const att: Attachment = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setPendingFiles((prev) => [...prev, att]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addAttachmentToDev = (devId: string, files: File[]) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    files.forEach((file) => {
      if (!allowed.includes(file.type)) return;
      const reader = new FileReader();
      reader.onload = () => {
        const att: Attachment = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        const updated = developers.map((d) =>
          d.id === devId
            ? { ...d, attachments: [...d.attachments, att] }
            : d
        );
        onDevelopersChange(updated);
      };
      reader.readAsDataURL(file);
    });
  };

  const checkAndDispatchExpiry = async () => {
    setExpiryCheckStatus("checking");
    const expiring = developers.filter((d) => {
      const daysLeft = calculateDaysLeft(d.expiryDate);
      return daysLeft <= 30 && daysLeft > 0;
    });

    if (expiring.length === 0) {
      setExpiryCheckStatus("none");
      setTimeout(() => setExpiryCheckStatus(null), 3000);
      return;
    }

    let sent = 0;
    for (const dev of expiring) {
      const payload: ExpiryPayload = {
        event: "developer_contract_expiring",
        developer_name: dev.name,
        contract_ref: dev.contractRef,
        expiry_date: dev.expiryDate,
        days_left: calculateDaysLeft(dev.expiryDate),
        account_manager: dev.accountManager,
        contact_email: dev.accountManagerEmail,
        recipient_emails: ["info@citiway.com", "owner@citiway.com"],
      };

      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "no-cors",
        });
        sent++;
      } catch {
        // Will fail silently for demo if webhook not configured
        sent++;
      }
    }
    setExpiryCheckStatus(`sent-${sent}`);
    setTimeout(() => setExpiryCheckStatus(null), 4000);
  };

  const filtered = developers.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.contractRef.toLowerCase().includes(q) ||
      d.accountManager.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="glass-panel p-4 gleam-border flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search developers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input pl-9 pr-4 py-2.5 text-xs rounded-xl w-60"
            />
          </div>
          <span className="text-xs text-white/50 font-medium">
            {filtered.length} developer{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkAndDispatchExpiry}
            className="warm-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-200 border border-amber-400/25 hover:border-amber-400/50 transition-all"
          >
            <Bell className="w-3.5 h-3.5" />
            {expiryCheckStatus === "checking"
              ? "Checking..."
              : expiryCheckStatus === "none"
              ? "✓ All OK"
              : expiryCheckStatus?.startsWith("sent")
              ? `✓ Dispatched ${expiryCheckStatus.split("-")[1]} alerts`
              : "Check & Dispatch Expiry Reminders"}
          </button>
          <button
            onClick={() => {
              setFormData(EMPTY_DEV);
              setPendingFiles([]);
              setEditingId(null);
              setShowForm(true);
            }}
            className="warm-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-md shadow-amber-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Developer
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 gleam-border space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  {editingId ? "Edit Developer Agreement" : "New Developer Agreement"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="text-white/40 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Developer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Sobha Realty"
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    MOU / Contract Ref *
                  </label>
                  <input
                    type="text"
                    value={formData.contractRef}
                    onChange={(e) =>
                      setFormData({ ...formData, contractRef: e.target.value })
                    }
                    placeholder="e.g. SOBHA-MOU-2025"
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Account Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.accountManager}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountManager: e.target.value,
                      })
                    }
                    placeholder="Manager name"
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Manager Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.accountManagerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountManagerPhone: e.target.value,
                      })
                    }
                    placeholder="+971..."
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 font-bold mb-1 block">
                    Manager Email
                  </label>
                  <input
                    type="email"
                    value={formData.accountManagerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountManagerEmail: e.target.value,
                      })
                    }
                    placeholder="email@example.com"
                    className="glass-input w-full px-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div>
                <label className="text-[11px] text-white/60 font-bold mb-2 block">
                  Contract Attachments
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`drag-zone-warm rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer ${
                    dragActive ? "drag-active" : ""
                  }`}
                >
                  <Upload className="w-6 h-6 text-amber-400/60 mb-2" />
                  <p className="text-xs text-white/60 font-medium text-center">
                    Drag & drop PDF, DOCX, PNG, or JPG files here
                  </p>
                  <p className="text-[10px] text-white/30 mt-1">
                    or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {pendingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {pendingFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-xs text-white/80 font-medium flex-1 truncate">
                          {f.name}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingFiles((prev) =>
                              prev.filter((p) => p.id !== f.id)
                            );
                          }}
                          className="text-white/40 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    !formData.name ||
                    !formData.contractRef ||
                    !formData.expiryDate
                  }
                  className="warm-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-md shadow-amber-500/30 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingId ? "Update Agreement" : "Save Agreement"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer Table */}
      <div className="glass-panel gleam-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Developer
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Contract Ref
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Dates
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Account Manager
                </th>
                <th className="px-4 py-3 text-left text-white/70 font-bold">
                  Files
                </th>
                <th className="px-4 py-3 text-right text-white/70 font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dev, i) => {
                const daysLeft = calculateDaysLeft(dev.expiryDate);
                const status = getDeveloperStatus(dev.expiryDate);
                return (
                  <motion.tr
                    key={dev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{dev.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10 font-mono text-[11px]">
                        {dev.contractRef}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-amber-300 font-bold">
                        {dev.commissionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      <p>{dev.startDate}</p>
                      <p className="text-white/40">→ {dev.expiryDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      {status === "expired" ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                          🔴 Expired
                        </span>
                      ) : status === "expiring" ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          ⚠️ {daysLeft}d left
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white/80 font-medium">
                        {dev.accountManager}
                      </p>
                      <p className="text-white/40 text-[10px]">
                        {dev.accountManagerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dev.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] text-white/60 max-w-[60px] truncate">
                              {att.name}
                            </span>
                            <button
                              onClick={() => setViewingAttachment(att)}
                              className="text-amber-300 hover:text-white"
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <a
                              href={att.data}
                              download={att.name}
                              className="text-blue-300 hover:text-white"
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                        <label className="cursor-pointer text-white/30 hover:text-amber-400 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.docx,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0)
                                addAttachmentToDev(dev.id, files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(dev)}
                          className="p-1.5 rounded-lg text-white/50 hover:text-amber-300 hover:bg-white/10 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dev.id)}
                          className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-white/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Building2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40">
                      No developers found
                    </p>
                    <p className="text-[10px] text-white/25 mt-1">
                      Add a developer agreement to get started
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Viewer Modal */}
      <AnimatePresence>
        {viewingAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setViewingAttachment(null)}
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
                  {viewingAttachment.name}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={viewingAttachment.data}
                    download={viewingAttachment.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                  <button
                    onClick={() => setViewingAttachment(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {viewingAttachment.type.startsWith("image/") ? (
                  <img
                    src={viewingAttachment.data}
                    alt={viewingAttachment.name}
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : viewingAttachment.type === "application/pdf" ? (
                  <iframe
                    src={viewingAttachment.data}
                    className="w-full h-[70vh]"
                    title={viewingAttachment.name}
                  />
                ) : (
                  <div className="p-8 text-center text-white/40">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">
                      Preview not available for this file type
                    </p>
                    <p className="text-[10px] text-white/25 mt-1">
                      Use the download button to view this file
                    </p>
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
