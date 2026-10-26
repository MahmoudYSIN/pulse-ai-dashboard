// ==========================================
// Admin Mini-CRM Type Definitions
// ==========================================

export interface Developer {
  id: string;
  name: string;
  contractRef: string;
  startDate: string;
  expiryDate: string;
  commissionRate: number;
  accountManager: string;
  accountManagerPhone: string;
  accountManagerEmail: string;
  status: "active" | "expiring" | "expired";
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64
  uploadedAt: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  filename: string;
  icon: string;
  description: string;
  pages: number;
}

export interface MarketingApprovalFields {
  landlordName: string;
  propertyType: "commercial" | "residential";
  dealType: "sale" | "rent";
  agreedPrice: string;
  titleDeedNo: string;
  landNo: string;
  area: string;
  community: string;
  buildingName: string;
}

export interface PaymentVoucherFields {
  receiptNo: string;
  receivedFrom: string;
  amount: string;
  amountInWords: string;
  unitNo: string;
  paymentMethod: string;
  checkRefNo: string;
  bankName: string;
  date: string;
}

export interface GeneralReceiptFields {
  date: string;
  receiptNo: string;
  name: string;
  address: string;
  trn: string;
  description: string;
  amount: string;
  vatAmount: string;
  total: string;
  paymentMethod: string;
  checkDetails: string;
}

export interface TenancyContractFields {
  lessorName: string;
  lessorEmiratesId: string;
  lessorLicenseNo: string;
  lessorPhone: string;
  lessorEmail: string;
  tenantName: string;
  tenantEmiratesId: string;
  tenantLicenseNo: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyUsage: string;
  plotNo: string;
  makani: string;
  buildingName: string;
  dewaPremisesNo: string;
  propertyArea: string;
  contractStartDate: string;
  contractEndDate: string;
  annualRent: string;
  securityDeposit: string;
  paymentMode: string;
}

export type TemplateFields =
  | MarketingApprovalFields
  | PaymentVoucherFields
  | GeneralReceiptFields
  | TenancyContractFields;

export interface ArchivedDocument {
  id: string;
  templateType: string;
  templateId: string;
  clientName: string;
  amountOrProperty: string;
  generationDate: string;
  stampIncluded: boolean;
  signatureIncluded: boolean;
  pdfBase64?: string;
  formData: Record<string, string>;
}

export interface Recipient {
  name: string;
  phone: string;
  email: string;
  company: string;
  project?: string;
}

export type AdminTab = "overview" | "developers" | "documents" | "archive";

export interface ExpiryPayload {
  event: "developer_contract_expiring";
  developer_name: string;
  contract_ref: string;
  expiry_date: string;
  days_left: number;
  account_manager: string;
  contact_email: string;
  recipient_emails: string[];
}
