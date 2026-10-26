import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./components/ClientProviders";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pulse AI Marketing Hub — Multi-Channel Campaign Manager",
  description:
    "All-in-one AI-powered campaign manager for WhatsApp and HTML Email newsletters with warm frosted glass UI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-geist-sans)] relative selection:bg-amber-500/40 selection:text-white">
        {/* Fixed vibrant warm light orbs that illuminate from behind the glass */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.45)_0%,transparent_60%)] blur-[90px]" />
          <div className="absolute top-[25%] right-[5%] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.35)_0%,transparent_65%)] blur-[100px]" />
          <div className="absolute bottom-[5%] left-[25%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.25)_0%,transparent_60%)] blur-[90px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <ClientProviders>
            {children}
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
