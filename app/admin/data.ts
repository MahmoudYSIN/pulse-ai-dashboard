import type { Developer, PDFTemplate, Recipient } from "./types";

export const SEED_DEVELOPERS: Developer[] = [
  {
    id: "dev-1",
    name: "Sobha Realty",
    contractRef: "SOBHA-MOU-2025",
    startDate: "2025-01-15",
    expiryDate: "2026-11-25",
    commissionRate: 5,
    accountManager: "Tariq Mansoor",
    accountManagerPhone: "+971554567890",
    accountManagerEmail: "tariq@innovateuae.com",
    status: "expiring",
    attachments: [],
  },
  {
    id: "dev-2",
    name: "Samana Developers",
    contractRef: "SAMANA-AGR-2024",
    startDate: "2024-06-01",
    expiryDate: "2027-06-01",
    commissionRate: 6,
    accountManager: "Ahmed Al Rashid",
    accountManagerPhone: "+971501234567",
    accountManagerEmail: "ahmed.rashid@emiratesholding.ae",
    status: "active",
    attachments: [],
  },
  {
    id: "dev-3",
    name: "Zoya Developments",
    contractRef: "ZOYA-MOU-2025",
    startDate: "2025-03-10",
    expiryDate: "2026-10-28",
    commissionRate: 4.5,
    accountManager: "Sarah Jenkins",
    accountManagerPhone: "+971529876543",
    accountManagerEmail: "s.jenkins@apexglobal.com",
    status: "expiring",
    attachments: [],
  },
  {
    id: "dev-4",
    name: "Emaar Properties",
    contractRef: "EMAAR-MOU-2024",
    startDate: "2024-02-20",
    expiryDate: "2026-10-20",
    commissionRate: 3.5,
    accountManager: "Fatima Al Zahra",
    accountManagerPhone: "+971567890123",
    accountManagerEmail: "fatima@citiwayrealty.com",
    status: "expired",
    attachments: [],
  },
  {
    id: "dev-5",
    name: "Damac Properties",
    contractRef: "DAMAC-AGR-2025",
    startDate: "2025-04-01",
    expiryDate: "2028-04-01",
    commissionRate: 7,
    accountManager: "Khalid Bin Omar",
    accountManagerPhone: "+971543210987",
    accountManagerEmail: "khalid@citiwayrealty.com",
    status: "active",
    attachments: [],
  },
  {
    id: "dev-6",
    name: "Binghatti Developers",
    contractRef: "BING-MOU-2025",
    startDate: "2025-07-15",
    expiryDate: "2027-07-15",
    commissionRate: 5.5,
    accountManager: "Layla Hassan",
    accountManagerPhone: "+971509876543",
    accountManagerEmail: "layla@citiwayrealty.com",
    status: "active",
    attachments: [],
  },
];

export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: "marketing-approval",
    name: "Citiway Marketing Approval Form",
    filename: "marketing-approval.pdf",
    icon: "📋",
    description: "Official marketing approval for property listings",
    pages: 1,
  },
  {
    id: "payment-voucher",
    name: "Citiway Payment Voucher",
    filename: "payment-voucher.pdf",
    icon: "💳",
    description: "Payment voucher with receipt details and amounts",
    pages: 1,
  },
  {
    id: "receipt-general",
    name: "Citiway General Receipt (5% VAT)",
    filename: "receipt-general.pdf",
    icon: "🧾",
    description: "General receipt with automatic 5% VAT calculation",
    pages: 1,
  },
  {
    id: "tenancy-contract",
    name: "DLD Unified Tenancy Contract",
    filename: "tenancy-contract.pdf",
    icon: "🏠",
    description: "Dubai Land Department unified tenancy contract — 2 pages",
    pages: 2,
  },
];

export const DEMO_RECIPIENTS: Recipient[] = [
  {
    name: "Ahmed Al Rashid",
    phone: "+971501234567",
    email: "ahmed.rashid@emiratesholding.ae",
    company: "Emirates Holdings",
    project: "Skyline Palm Residences",
  },
  {
    name: "Sarah Jenkins",
    phone: "+971529876543",
    email: "s.jenkins@apexglobal.com",
    company: "Apex Global Partners",
    project: "Downtown Canal Heights",
  },
  {
    name: "Tariq Mansoor",
    phone: "+971554567890",
    email: "tariq@innovateuae.com",
    company: "Innovate UAE",
    project: "Marina Bay Luxury Villa",
  },
  {
    name: "Fatima Al Zahra",
    phone: "+971567890123",
    email: "fatima@citiwayrealty.com",
    company: "Citiway Real Estate",
    project: "Sobha Hartland",
  },
  {
    name: "Omar Khalil",
    phone: "+971581234567",
    email: "omar.k@dubaiinvest.ae",
    company: "Dubai Investment Group",
    project: "Damac Lagoons",
  },
];

export const N8N_WEBHOOK_URL = "https://n8n.citiway.com/webhook/contract-expiry";

export function calculateDaysLeft(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDeveloperStatus(
  expiryDate: string
): "active" | "expiring" | "expired" {
  const daysLeft = calculateDaysLeft(expiryDate);
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "active";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
