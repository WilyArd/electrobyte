"use client";

import React, { useState } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { SupportedLanguage } from "@/lib/translations";
import { updateSettings } from "@/actions/profile";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  currentRegion: string;
}

export function SettingsModal({ isOpen, onClose, currentLanguage, currentRegion }: SettingsModalProps) {
  const { t, setLanguage } = useTranslation();
  
  const [language, setLocalLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [region, setLocalRegion] = useState(currentRegion);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("language", language);
    formData.append("region", region);
    
    const result = await updateSettings(null, formData);
    if (result.error) {
      alert(result.error);
    } else {
      // Update global context language
      setLanguage(language);
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-primary-100/10 dark:border-navy-500/30 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-primary-100/10 dark:border-navy-500/30 flex justify-between items-center bg-primary-50/5 dark:bg-navy-800/50">
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
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">
              {t("settings.language")}
            </label>
            <select
              value={language}
              onChange={(e) => setLocalLanguage(e.target.value as SupportedLanguage)}
              className="w-full bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300"
            >
              <option value="en">English (US)</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-2">
              {t("settings.region")}
            </label>
            <select
              value={region}
              onChange={(e) => setLocalRegion(e.target.value)}
              className="w-full bg-white dark:bg-navy-800 border border-primary-200/50 dark:border-navy-600 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-300"
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="ID">Indonesia</option>
              <option value="EU">Europe</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
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
              className="flex-1 btn-primary py-2.5"
            >
              {isSaving ? t("settings.saving") : t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
