"use client";

import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  AlertTriangle,
  Archive,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";
import type { AdminTab, Developer, ArchivedDocument } from "../types";
import { calculateDaysLeft } from "../data";

interface KPIOverviewProps {
  kpiData: {
    activeAgreements: number;
    expiringContracts: number;
    documentsThisMonth: number;
    totalArchived: number;
  };
  developers: (Developer & { daysLeft: number })[];
  archivedDocs: ArchivedDocument[];
  onNavigate: (tab: AdminTab) => void;
}

const KPI_CARDS = [
  {
    key: "activeAgreements",
    label: "Active Agreements",
    icon: Building2,
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    tab: "developers" as AdminTab,
  },
  {
    key: "expiringContracts",
    label: "Expiring < 30 Days",
    icon: AlertTriangle,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    tab: "developers" as AdminTab,
  },
  {
    key: "documentsThisMonth",
    label: "Documents This Month",
    icon: FileText,
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/20",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
    tab: "documents" as AdminTab,
  },
  {
    key: "totalArchived",
    label: "Total Archived",
    icon: Archive,
    gradient: "from-purple-400 to-pink-500",
    shadow: "shadow-purple-500/20",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
    tab: "archive" as AdminTab,
  },
];

export default function KPIOverview({
  kpiData,
  developers,
  archivedDocs,
  onNavigate,
}: KPIOverviewProps) {
  const expiringDevs = developers
    .filter((d) => d.status === "expiring" || d.status === "expired")
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const recentDocs = archivedDocs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card, i) => {
          const Icon = card.icon;
          const value = kpiData[card.key as keyof typeof kpiData];
          return (
            <motion.button
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              onClick={() => onNavigate(card.tab)}
              className="glass-panel p-5 gleam-border group cursor-pointer text-left hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-xs font-medium text-white/60">{card.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Contracts Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel p-6 gleam-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Clock className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Contract Alerts</h3>
              <p className="text-[11px] text-white/50">
                Agreements expiring or expired
              </p>
            </div>
          </div>
          {expiringDevs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-white/40 text-sm">
              <Activity className="w-4 h-4 mr-2" />
              All contracts are healthy
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
              {expiringDevs.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {dev.name}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {dev.contractRef} • {dev.accountManager}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {dev.daysLeft <= 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                        🔴 Expired
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        ⚠️ {dev.daysLeft}d left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {expiringDevs.length > 0 && (
            <button
              onClick={() => onNavigate("developers")}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/25 hover:border-amber-400/50 transition-all"
            >
              View All Developer Agreements →
            </button>
          )}
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-panel p-6 gleam-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Recent Documents
              </h3>
              <p className="text-[11px] text-white/50">
                Latest generated documents
              </p>
            </div>
          </div>
          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-white/40 text-sm text-center">
              <Archive className="w-8 h-8 mb-2 opacity-40" />
              No documents generated yet.
              <button
                onClick={() => onNavigate("documents")}
                className="mt-3 text-amber-300 text-xs font-bold underline hover:text-white"
              >
                Generate Your First Document →
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {doc.clientName}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {doc.templateType} •{" "}
                      {new Date(doc.generationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {doc.stampIncluded && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20">
                        Stamped
                      </span>
                    )}
                    {doc.signatureIncluded && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">
                        Signed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {recentDocs.length > 0 && (
            <button
              onClick={() => onNavigate("archive")}
              className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-400/25 hover:border-blue-400/50 transition-all"
            >
              View Full Archive →
            </button>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-panel p-6 gleam-border"
      >
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate("developers")}
            className="warm-btn flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 hover:border-emerald-400/40 transition-all group"
          >
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">Add Developer</p>
              <p className="text-[10px] text-white/50">
                Register new agreement
              </p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("documents")}
            className="warm-btn flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 hover:border-amber-400/40 transition-all group"
          >
            <FileText className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">Generate PDF</p>
              <p className="text-[10px] text-white/50">
                Prefill & issue document
              </p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("archive")}
            className="warm-btn flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 hover:border-purple-400/40 transition-all group"
          >
            <Archive className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <p className="text-sm font-bold text-white">View Vault</p>
              <p className="text-[10px] text-white/50">
                Browse archived documents
              </p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
