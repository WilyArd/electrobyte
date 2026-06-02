"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, currencyConfigs, SupportedLanguage, SupportedCurrency, TranslationKey } from "@/lib/translations";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currency: SupportedCurrency;
  setCurrency: (curr: SupportedCurrency) => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (usdAmount: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper to get default currency for a language
function getDefaultCurrencyForLanguage(lang: SupportedLanguage): SupportedCurrency {
  if (lang === "id") return "IDR";
  if (lang === "es" || lang === "fr") return "EUR";
  return "USD";
}

export const I18nProvider = ({
  children,
  defaultLanguage = "en",
}: {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");

  // Load settings on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("electrobyte-lang") as SupportedLanguage;
      const savedCurrency = localStorage.getItem("electrobyte-currency") as SupportedCurrency;

      if (savedLang) {
        setLanguageState(savedLang);
      }
      
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      } else {
        const defaultCurr = getDefaultCurrencyForLanguage(savedLang || defaultLanguage);
        setCurrencyState(defaultCurr);
      }
    }
  }, [defaultLanguage]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("electrobyte-lang", lang);
      
      // Auto switch currency to default for that language if not explicitly overridden
      const defaultCurr = getDefaultCurrencyForLanguage(lang);
      setCurrencyState(defaultCurr);
      localStorage.setItem("electrobyte-currency", defaultCurr);
    }
  };

  const setCurrency = (curr: SupportedCurrency) => {
    setCurrencyState(curr);
    if (typeof window !== "undefined") {
      localStorage.setItem("electrobyte-currency", curr);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const formatCurrency = (usdAmount: number): string => {
    const config = currencyConfigs[currency] || currencyConfigs["USD"];
    const converted = usdAmount * config.rate;
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: config.code === "IDR" ? 0 : 2,
      maximumFractionDigits: config.code === "IDR" ? 0 : 2,
    }).format(converted);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, currency, setCurrency, t, formatCurrency }}>
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
