"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Archive,
  ArrowLeft,
  Shield,
  Zap,
} from "lucide-react";
import type { AdminTab, Developer, ArchivedDocument, Recipient } from "./types";
import {
  SEED_DEVELOPERS,
  DEMO_RECIPIENTS,
  calculateDaysLeft,
  getDeveloperStatus,
} from "./data";
import KPIOverview from "./components/KPIOverview";
import DeveloperTracker from "./components/DeveloperTracker";
import PDFPrefillEngine from "./components/PDFPrefillEngine";
import DocumentArchive from "./components/DocumentArchive";

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "developers", label: "Developer Tracker", icon: <Building2 className="w-4 h-4" /> },
  { id: "documents", label: "PDF Prefill Engine", icon: <FileText className="w-4 h-4" /> },
  { id: "archive", label: "Document Archive", icon: <Archive className="w-4 h-4" /> },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [archivedDocs, setArchivedDocs] = useState<ArchivedDocument[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>(DEMO_RECIPIENTS);

  // Load from localStorage on mount
  useEffect(() => {
    const savedDevs = localStorage.getItem("crm_developers");
    const savedDocs = localStorage.getItem("crm_archived_docs");
    const savedRecipients = localStorage.getItem("crm_recipients");

    if (savedDevs) {
      try {
        setDevelopers(JSON.parse(savedDevs));
      } catch {
        setDevelopers(SEED_DEVELOPERS);
      }
    } else {
      setDevelopers(SEED_DEVELOPERS);
    }

    if (savedDocs) {
      try {
        setArchivedDocs(JSON.parse(savedDocs));
      } catch {
        setArchivedDocs([]);
      }
    }

    if (savedRecipients) {
      try {
        setRecipients(JSON.parse(savedRecipients));
      } catch {
        setRecipients(DEMO_RECIPIENTS);
      }
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (developers.length > 0) {
      localStorage.setItem("crm_developers", JSON.stringify(developers));
    }
  }, [developers]);

  useEffect(() => {
    localStorage.setItem("crm_archived_docs", JSON.stringify(archivedDocs));
  }, [archivedDocs]);

  // Recalculate developer statuses
  const enrichedDevelopers = developers.map((d) => ({
    ...d,
    status: getDeveloperStatus(d.expiryDate),
    daysLeft: calculateDaysLeft(d.expiryDate),
  }));

  const kpiData = {
    activeAgreements: enrichedDevelopers.filter((d) => d.status === "active").length,
    expiringContracts: enrichedDevelopers.filter((d) => d.status === "expiring").length,
    documentsThisMonth: archivedDocs.filter((d) => {
      const genDate = new Date(d.generationDate);
      const now = new Date();
      return genDate.getMonth() === now.getMonth() && genDate.getFullYear() === now.getFullYear();
    }).length,
    totalArchived: archivedDocs.length,
  };

  return (
    <main className="relative z-10 min-h-screen p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Admin Header */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel px-6 py-4 mb-6 gleam-border shadow-2xl"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Shield className="w-5.5 h-5.5 text-slate-950 fill-slate-950" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0c0e14] shadow-sm shadow-emerald-400/80 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Citiway</span>
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent font-extrabold">
                    Admin CRM
                  </span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  V2 Glass
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                Developer Agreements • PDF Engine • Document Vault
              </p>
            </div>
          </div>

          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/80 border border-white/15 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketing Hub
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 border border-amber-300/40"
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "developers" && kpiData.expiringContracts > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {kpiData.expiringContracts}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === "overview" && (
            <KPIOverview
              kpiData={kpiData}
              developers={enrichedDevelopers}
              archivedDocs={archivedDocs}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === "developers" && (
            <DeveloperTracker
              developers={enrichedDevelopers}
              onDevelopersChange={setDevelopers}
            />
          )}
          {activeTab === "documents" && (
            <PDFPrefillEngine
              recipients={recipients}
              archivedDocs={archivedDocs}
              onArchive={(doc) => setArchivedDocs((prev) => [doc, ...prev])}
            />
          )}
          {activeTab === "archive" && (
            <DocumentArchive
              documents={archivedDocs}
              onDocumentsChange={setArchivedDocs}
              onReEdit={(doc) => {
                setActiveTab("documents");
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
