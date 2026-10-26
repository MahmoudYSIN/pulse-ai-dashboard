"use client";
import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import RecipientManager, { DEMO_CONTACTS } from "./components/RecipientManager";
import WhatsAppPanel from "./components/WhatsAppPanel";
import EmailPanel from "./components/EmailPanel";
import PreviewPanel from "./components/PreviewPanel";
import ExecutionPanel from "./components/ExecutionPanel";
import ToastNotification from "./components/ToastNotification";
import {
  EMAIL_TEMPLATES,
  type Recipient,
  type ActiveChannel,
  type EditorMode,
  type Toast,
} from "./types";

export default function Home() {
  // Global active channel state
  const [activeChannel, setActiveChannel] = useState<ActiveChannel>("whatsapp");
  const [recipients, setRecipients] = useState<Recipient[]>(DEMO_CONTACTS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // WhatsApp channel state
  const [waMessage, setWaMessage] = useState(
    "Hi {{name}}, I'm reaching out from {{company}} regarding {{project}}. We've just released an exclusive new phase with prime canal views and private terraces. Would love to schedule a quick 5-minute call to share the VIP brochure with you!"
  );
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPrompt, setAiPrompt] = useState(
    "Maintain an executive, warm, and highly persuasive tone. Emphasize VIP launch terms and tailor context based on the project interest."
  );
  const [countryCode, setCountryCode] = useState("+971");
  const [waButtonsEnabled, setWaButtonsEnabled] = useState(true);
  const [waButtons, setWaButtons] = useState<string[]>([
    "مهتم 🌟",
    "غير مهتم 🙏",
  ]);

  // Email channel state
  const [emailSubject, setEmailSubject] = useState(
    EMAIL_TEMPLATES["real-estate"].subject
  );
  const [htmlContent, setHtmlContent] = useState(
    EMAIL_TEMPLATES["real-estate"].html
  );
  const [editorMode, setEditorMode] = useState<EditorMode>("visual");

  // Toast dispatchers
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dynamic Floating Toast System */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Futuristic Glassmorphic Navbar V2 */}
        <Header
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
        />

        {/* Dashboard Canvas */}
        <main className="flex-1 p-4 pt-5">
          <div className="max-w-[1600px] mx-auto space-y-5">
            {/* 1. Recipient Management Section */}
            <RecipientManager
              recipients={recipients}
              onRecipientsChange={setRecipients}
            />

            {/* 2. Interactive Channel Builder & Live Glass Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              {/* Left Column: Active Channel Panel */}
              <div className="flex flex-col">
                <AnimatePresence mode="wait">
                  {activeChannel === "whatsapp" ? (
                    <motion.div
                      key="whatsapp"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="h-full"
                    >
                      <WhatsAppPanel
                        message={waMessage}
                        onMessageChange={setWaMessage}
                        aiEnabled={aiEnabled}
                        onAiToggle={setAiEnabled}
                        aiPrompt={aiPrompt}
                        onAiPromptChange={setAiPrompt}
                        countryCode={countryCode}
                        onCountryCodeChange={setCountryCode}
                        buttonsEnabled={waButtonsEnabled}
                        onButtonsEnabledChange={setWaButtonsEnabled}
                        buttons={waButtons}
                        onButtonsChange={setWaButtons}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="h-full"
                    >
                      <EmailPanel
                        subject={emailSubject}
                        onSubjectChange={setEmailSubject}
                        htmlContent={htmlContent}
                        onHtmlContentChange={setHtmlContent}
                        editorMode={editorMode}
                        onEditorModeChange={setEditorMode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Hovering Glass Bubble Preview */}
              <div className="flex flex-col">
                <PreviewPanel
                  channel={activeChannel}
                  message={waMessage}
                  subject={emailSubject}
                  htmlContent={htmlContent}
                  recipients={recipients}
                  countryCode={countryCode}
                  buttonsEnabled={waButtonsEnabled}
                  buttons={waButtons}
                />
              </div>
            </div>

            {/* 3. Execution & Webhook Engine */}
            <ExecutionPanel
              channel={activeChannel}
              recipients={recipients}
              message={waMessage}
              subject={emailSubject}
              htmlContent={htmlContent}
              aiEnabled={aiEnabled}
              aiPrompt={aiPrompt}
              countryCode={countryCode}
              buttonsEnabled={waButtonsEnabled}
              buttons={waButtons}
              onToast={addToast}
            />
          </div>
        </main>

        {/* Studio Glass Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-6 py-5 text-center border-t border-white/10 mt-8"
        >
          <div className="flex items-center justify-center gap-2.5 text-xs text-amber-200/70">
            <span className="font-extrabold text-white">
              Pulse AI Marketing Hub V2
            </span>
            <span>•</span>
            <span className="text-amber-300 font-bold">
              WhatsApp Interactive Quick Replies & HTML Email Engine
            </span>
            <span>•</span>
            <span>Powered by n8n Webhook Architecture</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
