export interface Recipient {
  name: string;
  phone: string;
  email: string;
  company: string;
  project?: string;
  [key: string]: string | undefined;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export type ActiveChannel = "whatsapp" | "email";
export type EditorMode = "visual" | "html";
export type PreviewDevice = "desktop" | "mobile";

export interface CampaignPayload {
  channel: ActiveChannel;
  recipients: Recipient[];
  message?: string;
  subject?: string;
  htmlContent?: string;
  aiEnabled?: boolean;
  aiPrompt?: string;
  countryCode?: string;
  buttons?: string[];
  webhookUrl: string;
  scheduledAt?: string;
  isTest?: boolean;
  timestamp?: string;
}

export const EMAIL_TEMPLATES: Record<
  string,
  { name: string; subject: string; html: string }
> = {
  "real-estate": {
    name: "🏗️ Luxury Residence Launch",
    subject: "Private VIP Preview: {{project}} — Waterfront Residences Dubai",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:30px auto;background:#151821;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);box-shadow:0 30px 80px rgba(0,0,0,0.6);">
  <tr>
    <td style="background:linear-gradient(135deg,#1c1917,#292524);padding:45px 36px;text-align:center;border-bottom:1px solid rgba(245,158,11,0.25);">
      <p style="color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Exclusive Release</p>
      <h1 style="color:#ffffff;font-size:30px;font-weight:800;margin:0 0 10px;letter-spacing:-0.5px;">{{project}}</h1>
      <p style="color:#d6d3d1;font-size:14px;margin:0;">Curated by {{company}} • Prime Dubai Waterfront</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px;">
      <p style="color:#f5f5f4;font-size:16px;line-height:1.6;margin:0 0 16px;">Dear <strong>{{name}}</strong>,</p>
      <p style="color:#a8a29e;font-size:14px;line-height:1.8;margin:0 0 24px;">
        We are privileged to extend an advance private viewing invitation for <strong>{{project}}</strong>. Featuring iconic architectural silhouettes, floor-to-ceiling panoramic horizons, and signature hospitality amenities.
      </p>
      <div style="background:#1c1917;border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;margin-bottom:28px;">
        <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=320&fit=crop" alt="Property Render" style="width:100%;height:auto;display:block;">
        <div style="padding:18px 22px;">
          <table width="100%">
            <tr>
              <td>
                <p style="color:#f59e0b;font-size:12px;font-weight:700;margin:0;">STARTING OFFER</p>
                <p style="color:#ffffff;font-size:20px;font-weight:800;margin:4px 0 0;">AED 1.85M</p>
              </td>
              <td style="text-align:right;">
                <p style="color:#a8a29e;font-size:12px;margin:0;">PAYMENT PLAN</p>
                <p style="color:#ffffff;font-size:16px;font-weight:700;margin:4px 0 0;">60 / 40 Handover</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="#" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:10px;font-weight:800;font-size:15px;display:inline-block;box-shadow:0 10px 30px rgba(245,158,11,0.35);">RSVP For Private Viewing →</a>
      </div>
      <p style="color:#78716c;font-size:12px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin:0;">
        For bespoke portfolio advisory, contact the Private Client desk at +971 4 580 XXXX or reply to this transmission.
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#0c0e14;padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:#57534e;font-size:12px;margin:0;">© 2026 {{company}} Private Real Estate Advisory • Dubai, UAE</p>
    </td>
  </tr>
</table>
</body></html>`,
  },
  "promotional": {
    name: "✨ VIP Private Allocation",
    subject: "⚡ Exclusive 72h VIP Allocation: {{name}}, Special Terms Inside",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:30px auto;background:#151821;border-radius:18px;overflow:hidden;border:1px solid rgba(245,158,11,0.25);box-shadow:0 30px 80px rgba(0,0,0,0.6);">
  <tr>
    <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:45px 36px;text-align:center;">
      <h1 style="color:#0c0e14;font-size:32px;font-weight:900;margin:0 0 8px;letter-spacing:-0.5px;">VIP PRIVATE ALLOCATION</h1>
      <p style="color:#451a03;font-size:16px;font-weight:700;margin:0;">Preferred Terms Guaranteed • Limited To 15 Units</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px;">
      <p style="color:#f5f5f4;font-size:16px;line-height:1.6;margin:0 0 16px;">Hello <strong>{{name}}</strong>,</p>
      <p style="color:#a8a29e;font-size:14px;line-height:1.8;margin:0 0 24px;">
        As an esteemed partner of <strong>{{company}}</strong>, your account has been pre-approved for an exclusive 4% DLD waiver and guaranteed 10% net yield structure on our flagship launch.
      </p>
      <div style="background:#1c1917;border:1px dashed #f59e0b;border-radius:12px;padding:22px;text-align:center;margin:24px 0;">
        <p style="color:#f59e0b;font-size:36px;font-weight:900;margin:0;">4% DLD FEE WAIVER</p>
        <p style="color:#d6d3d1;font-size:13px;margin:6px 0 0;">Exclusive Reservation Code: <strong style="color:#fff;">GOLD-VIP-2026</strong></p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="#" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:10px;font-weight:800;font-size:15px;display:inline-block;box-shadow:0 10px 30px rgba(245,158,11,0.35);">Lock Priority Allocation →</a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#0c0e14;padding:24px;text-align:center;">
      <p style="color:#57534e;font-size:12px;margin:0;">© 2026 {{company}} • Unsubscribe</p>
    </td>
  </tr>
</table>
</body></html>`,
  },
  "weekly-digest": {
    name: "📰 Executive Market Brief",
    subject: "Market Intel #48: Q4 Capital Flows & Property Projections for {{name}}",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0e14;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:30px auto;background:#151821;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);box-shadow:0 30px 80px rgba(0,0,0,0.6);">
  <tr>
    <td style="background:linear-gradient(135deg,#1f2937,#111827);padding:36px;border-bottom:1px solid rgba(245,158,11,0.2);">
      <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 6px;">Executive Market Brief</h1>
      <p style="color:#f59e0b;font-size:13px;font-weight:600;margin:0;">Strategic Intelligence by {{company}}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px;">
      <p style="color:#f5f5f4;font-size:15px;line-height:1.6;margin:0 0 20px;">Dear <strong>{{name}}</strong>, here is your curated market digest:</p>
      <div style="border-left:3px solid #f59e0b;padding-left:16px;margin:22px 0;">
        <h3 style="color:#ffffff;font-size:15px;margin:0 0 4px;">📈 Prime Waterfront Surge</h3>
        <p style="color:#a8a29e;font-size:13px;line-height:1.6;margin:0;">Luxury villas and penthouses registered a 14.2% YoY appreciation in Q3.</p>
      </div>
      <div style="border-left:3px solid #fbbf24;padding-left:16px;margin:22px 0;">
        <h3 style="color:#ffffff;font-size:15px;margin:0 0 4px;">🏢 Institutional Pipeline</h3>
        <p style="color:#a8a29e;font-size:13px;line-height:1.6;margin:0;">New international funds entered Dubai freehold sectors with over $3.2B deployment.</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="#" style="background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block;">Read Full Strategic Report</a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#0c0e14;padding:24px;text-align:center;">
      <p style="color:#57534e;font-size:12px;margin:0;">© 2026 {{company}} • Manage Briefing Preferences</p>
    </td>
  </tr>
</table>
</body></html>`,
  },
};

export const COUNTRY_CODES = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];
