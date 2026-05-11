"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations, currencyConfig, SupportedLanguage, TranslationKey } from "@/lib/translations";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (usdAmount: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({
  children,
  defaultLanguage = "en",
}: {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const formatCurrency = (usdAmount: number): string => {
    const config = currencyConfig[language];
    const converted = usdAmount * config.rate;
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: language === "id" ? 0 : 2,
      maximumFractionDigits: language === "id" ? 0 : 2,
    }).format(converted);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, formatCurrency }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
