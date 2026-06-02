"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { SupportedLanguage, SupportedCurrency, currencyConfigs } from "@/lib/translations";
import { updateSettings } from "@/actions/profile";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  currentRegion: string;
  currentCurrency?: SupportedCurrency;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentLanguage,
  currentRegion,
  currentCurrency = "USD",
}: SettingsModalProps) {
  const { t, setLanguage, setCurrency } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<"preferences" | "support">("preferences");
  const [language, setLocalLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [region, setLocalRegion] = useState(currentRegion);
  const [currency, setLocalCurrency] = useState<SupportedCurrency>(currentCurrency);
  const [isSaving, setIsSaving] = useState(false);
  
  // CS Support Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Copy Email State
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Sync inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalLanguage(currentLanguage);
      setLocalRegion(currentRegion);
      setLocalCurrency(currentCurrency);
      
      // Initialize Chat Welcome Message
      setChatMessages([
        {
          id: "welcome",
          sender: "bot",
          text: t("settings.csWelcome"),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, currentLanguage, currentRegion, currentCurrency, t]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("language", language);
    formData.append("region", region);
    formData.append("currency", currency);
    
    const result = await updateSettings(null, formData);
    if (result.error) {
      alert(result.error);
    } else {
      // Update global contexts
      setLanguage(language);
      setCurrency(currency);
      onClose();
    }
    setIsSaving(false);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@electrobyte.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const query = chatInput.toLowerCase();
    setChatInput("");
    setIsTyping(true);

    // Simulated CS Reply matching user queries
    setTimeout(() => {
      let botResponse = "";

      if (language === "id") {
        if (query.includes("ongkir") || query.includes("pengiriman") || query.includes("kirim")) {
          botResponse = "Biaya pengiriman gratis untuk seluruh pesanan di atas Rp 1.500.000 (atau $99)! Untuk pesanan di bawah jumlah tersebut, akan dikenakan biaya flat ongkir sebesar Rp 150.000 ($9.99).";
        } else if (query.includes("bayar") || query.includes("pembayaran") || query.includes("rekening") || query.includes("kartu")) {
          botResponse = "Kami mendukung berbagai metode pembayaran aman termasuk Kartu Kredit (Visa/Mastercard), PayPal, dan Transfer Bank Virtual Account. Anda dapat mengaturnya di menu Metode Pembayaran profil Anda.";
        } else if (query.includes("garansi") || query.includes("rusak") || query.includes("klaim")) {
          botResponse = "Semua komponen & perangkat keras IT di ElectroByte dilindungi oleh garansi resmi distributor selama 1 hingga 3 tahun. Kami menjamin proses klaim yang cepat dan mudah tanpa ribet!";
        } else if (query.includes("admin") || query.includes("toko") || query.includes("lokasi")) {
          botResponse = "Showroom utama kami berlokasi di Jakarta Pusat. Kami buka setiap hari dari jam 09.00 hingga 21.00 WIB. Anda juga dapat memilih pengiriman instan (GoSend/Grab) langsung melalui website.";
        } else {
          botResponse = "Terima kasih banyak atas pertanyaan Anda! 💻 Asisten CS kami telah merekam pesan Anda, dan salah satu agen teknis kami akan segera membalas pesan Anda secara detail melalui WhatsApp atau Email terdaftar dalam waktu kurang dari 5 menit.";
        }
      } else {
        if (query.includes("shipping") || query.includes("delivery") || query.includes("postage")) {
          botResponse = "We offer free shipping on all orders over $99! For orders below this amount, a flat rate of $9.99 applies. Orders are processed within 24 hours.";
        } else if (query.includes("pay") || query.includes("payment") || query.includes("card")) {
          botResponse = "We accept all major credit cards (Visa, Mastercard, AMEX), PayPal, and secure bank transfers. You can manage them in your profile's Payment Methods tab.";
        } else if (query.includes("warranty") || query.includes("broken") || query.includes("claim")) {
          botResponse = "All hardware sold at ElectroByte comes with a 1 to 3 year official distributor warranty. We ensure a hassle-free and swift replacement process!";
        } else {
          botResponse = "Thank you for reaching out! 💻 Our customer support team has logged your inquiry. A live technical expert will contact you via your registered email or phone number in less than 5 minutes.";
        }
      }

      const botMessage: ChatMessage = {
        id: Math.random().toString(),
        sender: "bot",
        text: botResponse,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-primary-100/10 dark:border-navy-500/30 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-primary-100/10 dark:border-navy-500/30 flex justify-between items-center bg-primary-50/5 dark:bg-navy-800/50 flex-shrink-0">
          <h2 className="text-lg font-bold font-heading">
            {t("settings.title")}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Tabs Selector */}
        <div className="flex border-b border-primary-100/10 dark:border-navy-500/30 bg-primary-50/5 dark:bg-navy-800/20 px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === "preferences"
                ? "border-primary-500 text-primary-500 font-bold"
                : "border-transparent text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-navy-100"
            }`}
          >
            {t("settings.tabPreferences")}
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === "support"
                ? "border-primary-500 text-primary-500 font-bold"
                : "border-transparent text-navy-400 dark:text-navy-300 hover:text-navy-600 dark:hover:text-navy-100"
            }`}
          >
            {t("settings.tabSupport")}
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
          </button>
        </div>
        
        {/* Modal Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "preferences" ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Language Preference */}
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">
                  {t("settings.language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLocalLanguage(e.target.value as SupportedLanguage)}
                  className="w-full bg-white dark:bg-navy-850 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 dark:text-white"
                >
                  <option value="en">🇺🇸 English (US)</option>
                  <option value="id">🇮🇩 Bahasa Indonesia</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                </select>
              </div>
              
              {/* Region Preference */}
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">
                  {t("settings.region")}
                </label>
                <select
                  value={region}
                  onChange={(e) => setLocalRegion(e.target.value)}
                  className="w-full bg-white dark:bg-navy-850 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 dark:text-white"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="ID">Indonesia</option>
                  <option value="EU">Europe</option>
                  <option value="AU">Australia</option>
                </select>
              </div>

              {/* Currency Preference */}
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">
                  {t("settings.currency")}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setLocalCurrency(e.target.value as SupportedCurrency)}
                  className="w-full bg-white dark:bg-navy-850 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300 dark:text-white"
                >
                  {Object.entries(currencyConfigs).map(([code, config]) => (
                    <option key={code} value={code}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons for Preferences */}
              <div className="flex gap-3 pt-4 border-t border-primary-100/10 dark:border-navy-500/20">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 text-sm font-medium text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
                >
                  {t("settings.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isSaving ? t("settings.saving") : t("settings.save")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200 flex flex-col h-full max-h-[50vh]">
              {/* Top Actionable Channels */}
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                {/* WhatsApp Link Card */}
                <a
                  href="https://wa.me/628123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-center transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer overflow-hidden"
                >
                  {/* Pulse Effect */}
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>

                  <svg className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.59 1.97 14.12 1.05 11.5 1.05c-5.44 0-9.865 4.37-9.869 9.802-.001 1.76.476 3.479 1.383 4.98L2.023 21.84l6.183-1.611c-1.562 1.07-2.4 1.27-1.56 1.92zM17.65 14.28c-.3-.15-1.785-.88-2.067-.98-.28-.1-.49-.15-.69.15-.2.3-.78 1-.96 1.2-.18.2-.36.2-.66.05-1.02-.51-1.72-.92-2.42-1.52-.7-.6-.82-.88-.52-1.18.2-.2.4-.45.6-.68.2-.23.27-.4.4-.67.13-.26.06-.5-.03-.66-.1-.15-.8-1.92-1.1-2.65-.29-.7-.59-.6-.8-.6-.2 0-.43-.02-.66-.02-.23 0-.6.09-.9.4-.3.33-1.16 1.14-1.16 2.79 0 1.64 1.2 3.23 1.36 3.45.16.22 2.3 3.51 5.58 4.93.78.34 1.39.54 1.86.69.79.25 1.5.21 2.07.13.63-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35z" />
                  </svg>
                  <span className="text-sm font-bold text-navy-800 dark:text-navy-100 mt-2">
                    {t("settings.csWhatsApp")}
                  </span>
                  <span className="text-[10px] text-navy-400 dark:text-navy-300 mt-1 max-w-[130px]">
                    {t("settings.csWhatsAppDesc")}
                  </span>
                </a>

                {/* Email Support Card */}
                <div
                  onClick={handleCopyEmail}
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer"
                >
                  <svg className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-bold text-navy-800 dark:text-navy-100 mt-2">
                    {t("settings.csEmail")}
                  </span>
                  <span className="text-xs text-primary-500 font-medium font-mono mt-1 select-all">
                    {copiedEmail ? t("settings.csCopied") : t("settings.csEmailDesc")}
                  </span>
                </div>
              </div>

              {/* Live Chat Simulator Container */}
              <div className="flex-1 flex flex-col border border-primary-100/20 dark:border-navy-600 rounded-xl overflow-hidden min-h-[250px] bg-primary-50/5 dark:bg-navy-950/20">
                <div className="bg-primary-500/5 px-4 py-2 border-b border-primary-100/10 dark:border-navy-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold font-heading text-navy-700 dark:text-navy-200">
                    {t("settings.csLiveChat")}
                  </span>
                  <span className="text-[10px] text-navy-400 dark:text-navy-300 ml-auto">
                    {t("settings.csLiveChatDesc")}
                  </span>
                </div>

                {/* Chat History Panel */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[160px] min-h-[140px] text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                          msg.sender === "user"
                            ? "bg-primary-500 text-white rounded-tr-none"
                            : "bg-white dark:bg-navy-800 text-navy-800 dark:text-navy-100 rounded-tl-none border border-primary-100/10 dark:border-navy-700"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-navy-400 dark:text-navy-350 mt-0.5 px-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-[10px] text-navy-400 dark:text-navy-300 animate-pulse">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span>{t("settings.csTyping")}</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-primary-100/10 dark:border-navy-600 p-2 flex gap-2 bg-white dark:bg-navy-900"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("settings.csPlaceholder")}
                    className="flex-1 bg-primary-50/5 dark:bg-navy-800 border border-primary-100/20 dark:border-navy-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 text-navy-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="btn-primary !px-4 !py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <span>{t("settings.csSend")}</span>
                    <svg className="w-3 h-3 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
