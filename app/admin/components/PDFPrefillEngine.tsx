"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Stamp,
  PenTool,
  Users,
  ChevronDown,
  Sparkles,
  Loader2,
  CheckCircle,
  X,
  RotateCcw,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { ArchivedDocument, Recipient } from "../types";
import { PDF_TEMPLATES, generateId } from "../data";

interface PDFPrefillEngineProps {
  recipients: Recipient[];
  archivedDocs: ArchivedDocument[];
  onArchive: (doc: ArchivedDocument) => void;
}

// WinAnsi-safe text converter to prevent PDF embedding/preview crashes
function safeText(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/[\u2713\u2714\u2611]/g, "X") // checkmarks to X
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, "-") // en/em dashes
    .replace(/[\u2022\u2023]/g, "*") // bullets
    .replace(/[^\x00-\xFF]/g, ""); // strip any remaining non-WinAnsi / non-Latin1 characters
}

// External reusable Field component to prevent re-creation on render and avoid input focus loss
interface FormFieldProps {
  label: string;
  field: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function FormField({
  label,
  field,
  value,
  onChange,
  placeholder,
  type = "text",
}: FormFieldProps) {
  return (
    <div>
      <label className="text-[11px] text-white/60 font-bold mb-1.5 block">
        {label}
      </label>
      <input
        id={`input-${field}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input w-full px-3 py-2.5 text-xs"
      />
    </div>
  );
}

// External reusable ToggleBtn component
interface ToggleBtnProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ToggleBtn({ active, onClick, label }: ToggleBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active
          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 border border-amber-300/40"
          : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

export default function PDFPrefillEngine({
  recipients,
  archivedDocs,
  onArchive,
}: PDFPrefillEngineProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(PDF_TEMPLATES[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [includeStamp, setIncludeStamp] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Reset form when template changes
  useEffect(() => {
    setFormData({});
    setPreviewUrl(null);
    setGenerated(false);
  }, [selectedTemplate.id]);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate VAT for receipt
      if (selectedTemplate.id === "receipt-general" && key === "amount") {
        const amount = parseFloat(value) || 0;
        const vat = amount * 0.05;
        updated.vatAmount = vat.toFixed(2);
        updated.total = (amount + vat).toFixed(2);
      }
      return updated;
    });
  };

  const fillFromRecipient = (r: Recipient) => {
    const updates: Record<string, string> = {};
    switch (selectedTemplate.id) {
      case "marketing-approval":
        updates.landlordName = r.name;
        break;
      case "payment-voucher":
        updates.receivedFrom = r.name;
        break;
      case "receipt-general":
        updates.name = r.name;
        updates.address = r.company || "";
        break;
      case "tenancy-contract":
        updates.tenantName = r.name;
        updates.tenantPhone = r.phone;
        updates.tenantEmail = r.email;
        break;
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    setShowRecipientPicker(false);
  };

  const generatePDF = useCallback(async () => {
    setGenerating(true);
    try {
      const templateUrl = `/templates/${selectedTemplate.filename}`;
      const existingPdfBytes = await fetch(templateUrl).then((r) =>
        r.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 10.5;
      const smallFont = 9;
      const color = rgb(0.1, 0.1, 0.1);

      // Embed stamp and signature if needed
      let stampImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
      let sigImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;

      if (includeStamp) {
        try {
          const stampBytes = await fetch("/citiway-stamp.png").then((r) =>
            r.arrayBuffer()
          );
          stampImage = await pdfDoc.embedPng(stampBytes);
        } catch {
          // stamp not available
        }
      }

      if (includeSignature) {
        try {
          const sigBytes = await fetch("/eyad-signature.png").then((r) =>
            r.arrayBuffer()
          );
          sigImage = await pdfDoc.embedPng(sigBytes);
        } catch {
          // signature not available
        }
      }

      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();

      // Check if PDF has native AcroForm fields (Option A: AcroForm Auto-Fill)
      let form: ReturnType<typeof pdfDoc.getForm> | null = null;
      try {
        form = pdfDoc.getForm();
      } catch {
        form = null;
      }

      const hasFields = form && form.getFields().length > 0;

      // Smart AcroForm Auto-Fill Helpers
      const setFormText = (fieldName: string, val: string) => {
        if (!form || !val) return;
        try {
          const field = form.getTextField(fieldName);
          if (field) field.setText(safeText(val));
        } catch {
          // field may be dropdown or not present
        }
      };

      const setFormCheck = (fieldName: string, shouldCheck: boolean) => {
        if (!form) return;
        try {
          const box = form.getCheckBox(fieldName);
          if (box) {
            if (shouldCheck) box.check();
            else box.uncheck();
          }
        } catch {
          // not a checkbox
        }
      };

      const setFormDropdown = (fieldName: string, val: string) => {
        if (!form || !val) return;
        try {
          const dropdown = form.getDropdown(fieldName);
          if (dropdown) dropdown.select(safeText(val));
        } catch {
          // dropdown fallback
        }
      };

      if (hasFields && form) {
        // Zero-coordinate native AcroForm Auto-Fill
        switch (selectedTemplate.id) {
          case "marketing-approval": {
            setFormText("date", formData.date || new Date().toISOString().split("T")[0]);
            setFormText("landlord_seller", formData.landlordName || "");
            setFormCheck("type_commercial", formData.propertyType === "commercial");
            setFormCheck("type_residential", formData.propertyType === "residential");
            setFormCheck("for_sale", formData.dealType === "sale");
            setFormCheck("for_rent", formData.dealType === "rent");
            setFormText("price_aed", formData.agreedPrice || "");
            setFormText("property_details_1", formData.propertyDetails || "");
            setFormText("title_deed_no", formData.titleDeedNo || "");
            setFormText("land_no", formData.landNo || "");
            setFormText("area", formData.area || "");
            setFormText("community", formData.community || "");
            setFormText("building_name", formData.buildingName || "");

            // Stamp & Signature overlays
            if (stampImage) {
              page.drawImage(stampImage, { x: 110, y: height - 660, width: 110, height: 110, opacity: 0.85 });
            }
            if (sigImage) {
              page.drawImage(sigImage, { x: 250, y: height - 650, width: 100, height: 50, opacity: 0.9 });
            }
            break;
          }
          case "payment-voucher": {
            setFormText("receipt_date", formData.date || new Date().toISOString().split("T")[0]);
            setFormText("receipt_no", formData.receiptNo || "");
            setFormText("payer_name", formData.receivedFrom || "");
            setFormText("payer_contact", formData.payerContact || "");
            setFormText("amount", formData.amount ? `AED ${formData.amount}` : "");
            setFormText("amount_words", formData.amountInWords || "");
            setFormText("payment_for", formData.paymentFor || "Real Estate Brokerage");
            setFormText("unit_no", formData.unitNo || "");
            setFormDropdown("payment_method", formData.paymentMethod || "Bank Transfer");
            setFormText("check_no", formData.checkRefNo || "");
            setFormText("bank_name", formData.bankName || "");
            setFormText("check_date", formData.date || "");
            setFormText("received_by", "Citiway Real Estate");

            if (stampImage) {
              page.drawImage(stampImage, { x: width - 180, y: 60, width: 80, height: 80, opacity: 0.85 });
            }
            if (sigImage) {
              page.drawImage(sigImage, { x: width - 280, y: 55, width: 90, height: 50, opacity: 0.9 });
            }
            break;
          }
          case "receipt-general": {
            setFormText("receipt_date", formData.date || new Date().toISOString().split("T")[0]);
            setFormText("receipt_no", formData.receiptNo || "");
            setFormText("from_name", formData.name || "");
            setFormText("from_address", formData.address || "");
            setFormText("from_trn", formData.trn || "");
            setFormText("to_name", "Citiway Real Estate LLC");
            setFormText("to_address", "Dubai, UAE");
            setFormText("to_trn", "100234567800003");
            setFormText("description", formData.description || "Marketing & Agency Services");
            setFormText("amount", formData.amount ? `AED ${formData.amount}` : "");
            setFormText("vat", formData.vatAmount ? `AED ${formData.vatAmount}` : "");
            setFormText("total", formData.total ? `AED ${formData.total}` : "");
            setFormText("amount_words", formData.amountInWords || "");
            setFormDropdown("payment_method", formData.paymentMethod || "Bank Transfer");
            setFormText("check_no", formData.checkDetails || "");
            setFormText("received_by", "Citiway Admin");

            if (stampImage) {
              page.drawImage(stampImage, { x: width - 180, y: 60, width: 80, height: 80, opacity: 0.85 });
            }
            if (sigImage) {
              page.drawImage(sigImage, { x: width - 280, y: 55, width: 90, height: 50, opacity: 0.9 });
            }
            break;
          }
        }

        // Flatten form so values are permanently rendered as vector text
        try {
          form.flatten();
        } catch (e) {
          console.warn("Could not flatten PDF form:", e);
        }
      } else {
        // Fallback for non-AcroForm templates (e.g. tenancy contract)
        switch (selectedTemplate.id) {
        case "tenancy-contract": {
          const d = (key: string) => safeText(formData[key] || "");
          // Page 1 - Lessor & Tenant & Property
          page.drawText(d("lessorName"), { x: 180, y: height - 195, size: fontSize, font: helveticaBold, color });
          page.drawText(d("lessorEmiratesId"), { x: 180, y: height - 218, size: fontSize, font: helvetica, color });
          page.drawText(d("lessorLicenseNo"), { x: 180, y: height - 241, size: fontSize, font: helvetica, color });
          page.drawText(d("lessorPhone"), { x: 180, y: height - 264, size: fontSize, font: helvetica, color });
          page.drawText(d("lessorEmail"), { x: 180, y: height - 287, size: fontSize, font: helvetica, color });

          page.drawText(d("tenantName"), { x: 180, y: height - 335, size: fontSize, font: helveticaBold, color });
          page.drawText(d("tenantEmiratesId"), { x: 180, y: height - 358, size: fontSize, font: helvetica, color });
          page.drawText(d("tenantLicenseNo"), { x: 180, y: height - 381, size: fontSize, font: helvetica, color });
          page.drawText(d("tenantPhone"), { x: 180, y: height - 404, size: fontSize, font: helvetica, color });
          page.drawText(d("tenantEmail"), { x: 180, y: height - 427, size: fontSize, font: helvetica, color });

          page.drawText(d("propertyUsage"), { x: 180, y: height - 480, size: fontSize, font: helvetica, color });
          page.drawText(d("plotNo"), { x: 180, y: height - 503, size: fontSize, font: helvetica, color });
          page.drawText(d("makani"), { x: 180, y: height - 526, size: fontSize, font: helvetica, color });
          page.drawText(d("buildingName"), { x: 180, y: height - 549, size: fontSize, font: helvetica, color });
          page.drawText(d("dewaPremisesNo"), { x: 180, y: height - 572, size: fontSize, font: helvetica, color });
          page.drawText(d("propertyArea"), { x: 180, y: height - 595, size: fontSize, font: helvetica, color });

          // Page 2 - Contract terms
          if (pdfDoc.getPageCount() >= 2) {
            const page2 = pdfDoc.getPage(1);
            const h2 = page2.getSize().height;
            page2.drawText(d("contractStartDate"), { x: 180, y: h2 - 170, size: fontSize, font: helvetica, color });
            page2.drawText(d("contractEndDate"), { x: 180, y: h2 - 193, size: fontSize, font: helvetica, color });
            page2.drawText(safeText(`AED ${formData["annualRent"] || ""}`), { x: 180, y: h2 - 240, size: fontSize, font: helveticaBold, color });
            page2.drawText(safeText(`AED ${formData["securityDeposit"] || ""}`), { x: 180, y: h2 - 263, size: fontSize, font: helvetica, color });
            page2.drawText(d("paymentMode"), { x: 180, y: h2 - 286, size: fontSize, font: helvetica, color });

            if (stampImage) {
              page2.drawImage(stampImage, { x: page2.getSize().width - 180, y: 60, width: 80, height: 80, opacity: 0.85 });
            }
            if (sigImage) {
              page2.drawImage(sigImage, { x: page2.getSize().width - 280, y: 55, width: 90, height: 50, opacity: 0.9 });
            }
          }
          break;
        }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes) as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setGenerated(true);

      // Convert to base64 for archiving
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const clientName =
          formData.landlordName ||
          formData.receivedFrom ||
          formData.name ||
          formData.tenantName ||
          "Unknown";
        const amountOrProperty =
          formData.agreedPrice ||
          formData.amount ||
          formData.total ||
          formData.annualRent ||
          formData.buildingName ||
          "";

        const doc: ArchivedDocument = {
          id: generateId(),
          templateType: selectedTemplate.name,
          templateId: selectedTemplate.id,
          clientName,
          amountOrProperty: amountOrProperty ? `AED ${amountOrProperty}` : "",
          generationDate: new Date().toISOString(),
          stampIncluded: includeStamp,
          signatureIncluded: includeSignature,
          pdfBase64: base64,
          formData: { ...formData },
        };
        onArchive(doc);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [selectedTemplate, formData, includeStamp, includeSignature, onArchive]);

  const downloadPDF = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    const clientName =
      formData.landlordName ||
      formData.receivedFrom ||
      formData.name ||
      formData.tenantName ||
      "document";
    a.download = `${selectedTemplate.id}-${clientName
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;
    a.click();
  };

  // Template-specific form fields renderer
  const renderFormFields = () => {
    switch (selectedTemplate.id) {
      case "marketing-approval":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" field="date" value={formData.date || ""} onChange={(v) => updateField("date", v)} type="date" />
            <FormField label="Landlord / Seller Name" field="landlordName" value={formData.landlordName || ""} onChange={(v) => updateField("landlordName", v)} placeholder="Full name" />
            <div>
              <label className="text-[11px] text-white/60 font-bold mb-1.5 block">Property Type</label>
              <div className="flex gap-2">
                <ToggleBtn active={formData.propertyType === "commercial"} onClick={() => updateField("propertyType", "commercial")} label="Commercial" />
                <ToggleBtn active={formData.propertyType === "residential"} onClick={() => updateField("propertyType", "residential")} label="Residential" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white/60 font-bold mb-1.5 block">Deal Type</label>
              <div className="flex gap-2">
                <ToggleBtn active={formData.dealType === "sale"} onClick={() => updateField("dealType", "sale")} label="Sale" />
                <ToggleBtn active={formData.dealType === "rent"} onClick={() => updateField("dealType", "rent")} label="Rent" />
              </div>
            </div>
            <FormField label="Agreed Price (AED)" field="agreedPrice" value={formData.agreedPrice || ""} onChange={(v) => updateField("agreedPrice", v)} placeholder="e.g. 2,500,000" type="text" />
            <div className="md:col-span-2">
              <FormField label="Property Details" field="propertyDetails" value={formData.propertyDetails || ""} onChange={(v) => updateField("propertyDetails", v)} placeholder="e.g. 3 Bedroom Villa, Sea View, Type A" />
            </div>
            <FormField label="Title Deed No" field="titleDeedNo" value={formData.titleDeedNo || ""} onChange={(v) => updateField("titleDeedNo", v)} placeholder="Title deed number" />
            <FormField label="Land No" field="landNo" value={formData.landNo || ""} onChange={(v) => updateField("landNo", v)} placeholder="Land number" />
            <FormField label="Area (sqft)" field="area" value={formData.area || ""} onChange={(v) => updateField("area", v)} placeholder="e.g. 1,250" />
            <FormField label="Community" field="community" value={formData.community || ""} onChange={(v) => updateField("community", v)} placeholder="e.g. Downtown Dubai" />
            <FormField label="Building Name" field="buildingName" value={formData.buildingName || ""} onChange={(v) => updateField("buildingName", v)} placeholder="e.g. Burj Khalifa Tower" />
          </div>
        );
      case "payment-voucher":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Receipt No" field="receiptNo" value={formData.receiptNo || ""} onChange={(v) => updateField("receiptNo", v)} placeholder="e.g. PV-2026-001" />
            <FormField label="Received From" field="receivedFrom" value={formData.receivedFrom || ""} onChange={(v) => updateField("receivedFrom", v)} placeholder="Payer name" />
            <FormField label="Amount (AED)" field="amount" value={formData.amount || ""} onChange={(v) => updateField("amount", v)} placeholder="e.g. 50,000" type="text" />
            <FormField label="Amount in Words" field="amountInWords" value={formData.amountInWords || ""} onChange={(v) => updateField("amountInWords", v)} placeholder="Fifty Thousand Dirhams" />
            <FormField label="Unit No" field="unitNo" value={formData.unitNo || ""} onChange={(v) => updateField("unitNo", v)} placeholder="e.g. 1204" />
            <FormField label="Payment Method" field="paymentMethod" value={formData.paymentMethod || ""} onChange={(v) => updateField("paymentMethod", v)} placeholder="Cash / Bank Transfer / Cheque" />
            <FormField label="Check / Ref No" field="checkRefNo" value={formData.checkRefNo || ""} onChange={(v) => updateField("checkRefNo", v)} placeholder="Reference number" />
            <FormField label="Bank Name" field="bankName" value={formData.bankName || ""} onChange={(v) => updateField("bankName", v)} placeholder="e.g. Emirates NBD" />
            <FormField label="Date" field="date" value={formData.date || ""} onChange={(v) => updateField("date", v)} type="date" />
          </div>
        );
      case "receipt-general":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date" field="date" value={formData.date || ""} onChange={(v) => updateField("date", v)} type="date" />
            <FormField label="Receipt No" field="receiptNo" value={formData.receiptNo || ""} onChange={(v) => updateField("receiptNo", v)} placeholder="e.g. GR-2026-001" />
            <FormField label="Name" field="name" value={formData.name || ""} onChange={(v) => updateField("name", v)} placeholder="Client name" />
            <FormField label="Address" field="address" value={formData.address || ""} onChange={(v) => updateField("address", v)} placeholder="Full address" />
            <FormField label="TRN" field="trn" value={formData.trn || ""} onChange={(v) => updateField("trn", v)} placeholder="Tax Registration Number" />
            <div className="md:col-span-2">
              <FormField label="Description" field="description" value={formData.description || ""} onChange={(v) => updateField("description", v)} placeholder="Service / item description" />
            </div>
            <FormField label="Amount (AED)" field="amount" value={formData.amount || ""} onChange={(v) => updateField("amount", v)} placeholder="e.g. 10,000" type="text" />
            <div>
              <label className="text-[11px] text-white/60 font-bold mb-1.5 block">5% VAT (Auto)</label>
              <input value={formData.vatAmount || "0.00"} readOnly className="glass-input w-full px-3 py-2.5 text-xs opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-[11px] text-white/60 font-bold mb-1.5 block">Total (Auto)</label>
              <input value={formData.total || "0.00"} readOnly className="glass-input w-full px-3 py-2.5 text-xs opacity-60 cursor-not-allowed font-bold text-amber-300" />
            </div>
            <FormField label="Payment Method" field="paymentMethod" value={formData.paymentMethod || ""} onChange={(v) => updateField("paymentMethod", v)} placeholder="Cash / Transfer / Cheque" />
            <FormField label="Check Details" field="checkDetails" value={formData.checkDetails || ""} onChange={(v) => updateField("checkDetails", v)} placeholder="Check no, bank, date" />
          </div>
        );
      case "tenancy-contract":
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center text-[10px]">1</span>
                Lessor Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Lessor Name" field="lessorName" value={formData.lessorName || ""} onChange={(v) => updateField("lessorName", v)} placeholder="Lessor full name" />
                <FormField label="Emirates ID" field="lessorEmiratesId" value={formData.lessorEmiratesId || ""} onChange={(v) => updateField("lessorEmiratesId", v)} placeholder="784-XXXX-XXXXXXX-X" />
                <FormField label="License No" field="lessorLicenseNo" value={formData.lessorLicenseNo || ""} onChange={(v) => updateField("lessorLicenseNo", v)} placeholder="Trade license" />
                <FormField label="Phone" field="lessorPhone" value={formData.lessorPhone || ""} onChange={(v) => updateField("lessorPhone", v)} placeholder="+971..." />
                <FormField label="Email" field="lessorEmail" value={formData.lessorEmail || ""} onChange={(v) => updateField("lessorEmail", v)} placeholder="lessor@email.com" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center text-[10px]">2</span>
                Tenant Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Tenant Name" field="tenantName" value={formData.tenantName || ""} onChange={(v) => updateField("tenantName", v)} placeholder="Tenant full name" />
                <FormField label="Emirates ID" field="tenantEmiratesId" value={formData.tenantEmiratesId || ""} onChange={(v) => updateField("tenantEmiratesId", v)} placeholder="784-XXXX-XXXXXXX-X" />
                <FormField label="License No" field="tenantLicenseNo" value={formData.tenantLicenseNo || ""} onChange={(v) => updateField("tenantLicenseNo", v)} placeholder="Trade license" />
                <FormField label="Phone" field="tenantPhone" value={formData.tenantPhone || ""} onChange={(v) => updateField("tenantPhone", v)} placeholder="+971..." />
                <FormField label="Email" field="tenantEmail" value={formData.tenantEmail || ""} onChange={(v) => updateField("tenantEmail", v)} placeholder="tenant@email.com" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center text-[10px]">3</span>
                Property Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Usage" field="propertyUsage" value={formData.propertyUsage || ""} onChange={(v) => updateField("propertyUsage", v)} placeholder="Residential / Commercial" />
                <FormField label="Plot No" field="plotNo" value={formData.plotNo || ""} onChange={(v) => updateField("plotNo", v)} placeholder="Plot number" />
                <FormField label="Makani" field="makani" value={formData.makani || ""} onChange={(v) => updateField("makani", v)} placeholder="Makani number" />
                <FormField label="Building Name" field="buildingName" value={formData.buildingName || ""} onChange={(v) => updateField("buildingName", v)} placeholder="Building name" />
                <FormField label="DEWA Premises No" field="dewaPremisesNo" value={formData.dewaPremisesNo || ""} onChange={(v) => updateField("dewaPremisesNo", v)} placeholder="DEWA number" />
                <FormField label="Area (sqft)" field="propertyArea" value={formData.propertyArea || ""} onChange={(v) => updateField("propertyArea", v)} placeholder="e.g. 850" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center text-[10px]">4</span>
                Contract Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Start Date" field="contractStartDate" value={formData.contractStartDate || ""} onChange={(v) => updateField("contractStartDate", v)} type="date" />
                <FormField label="End Date" field="contractEndDate" value={formData.contractEndDate || ""} onChange={(v) => updateField("contractEndDate", v)} type="date" />
                <FormField label="Annual Rent (AED)" field="annualRent" value={formData.annualRent || ""} onChange={(v) => updateField("annualRent", v)} placeholder="e.g. 85,000" type="text" />
                <FormField label="Security Deposit (AED)" field="securityDeposit" value={formData.securityDeposit || ""} onChange={(v) => updateField("securityDeposit", v)} placeholder="e.g. 5,000" type="text" />
                <FormField label="Payment Mode" field="paymentMode" value={formData.paymentMode || ""} onChange={(v) => updateField("paymentMode", v)} placeholder="Monthly / Quarterly / Annual" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Template Selector */}
      <div className="glass-panel p-5 gleam-border">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          Select Template
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PDF_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedTemplate.id === t.id
                  ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400/50 shadow-lg shadow-amber-500/15"
                  : "bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20"
              }`}
            >
              <span className="text-2xl mb-2 block">{t.icon}</span>
              <p className="text-xs font-bold text-white mb-0.5">{t.name}</p>
              <p className="text-[10px] text-white/40">{t.description}</p>
              <p className="text-[10px] text-amber-300/60 mt-1.5 font-medium">
                {t.pages} page{t.pages > 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form Section (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass-panel p-6 gleam-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {selectedTemplate.name}
              </h3>
              <div className="relative">
                <button
                  onClick={() =>
                    setShowRecipientPicker(!showRecipientPicker)
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  Sync from Leads
                  <ChevronDown className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {showRecipientPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 z-30 w-72 glass-panel p-3 gleam-border shadow-2xl"
                    >
                      <p className="text-[10px] text-white/50 font-bold mb-2">
                        Select lead to populate
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {recipients.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => fillFromRecipient(r)}
                            className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/30 transition-all"
                          >
                            <p className="text-xs font-bold text-white">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-white/40">
                              {r.email} • {r.company}
                            </p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {renderFormFields()}
          </div>

          {/* Stamp & Signature Toggles */}
          <div className="glass-panel p-5 gleam-border flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIncludeStamp(!includeStamp)}
                className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${
                  includeStamp
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-[3px] transition-all ${
                    includeStamp ? "left-[19px]" : "left-[3px]"
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white/80">
                  Official Citiway Stamp
                </span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIncludeSignature(!includeSignature)}
                className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${
                  includeSignature
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30"
                    : "bg-white/10"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-[3px] transition-all ${
                    includeSignature ? "left-[19px]" : "left-[3px]"
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white/80">
                  Authorized Manager Signature
                </span>
              </div>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePDF}
            disabled={generating}
            className="warm-btn w-full py-4 rounded-xl text-sm font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-300/40 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : generated ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Regenerate PDF
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white" />
                Generate PDF Document
              </>
            )}
          </button>
        </div>

        {/* Preview Section (2/5) */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-5 gleam-border sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                Live Preview
              </h3>
              {previewUrl && (
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              )}
            </div>
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px]"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-white/30">
                  <FileText className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No preview yet</p>
                  <p className="text-[10px] text-white/20 mt-1">
                    Fill in the form and generate to see preview
                  </p>
                </div>
              )}
            </div>
            {generated && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-300 font-medium">
                  Document generated & archived successfully
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
