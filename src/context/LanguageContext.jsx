import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { translateText } from "../i18n/translations.js";

const LANGUAGE_KEY = "notely-language";
const LanguageContext = createContext(null);

function getSavedLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) === "ar" ? "ar" : "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(nextLanguage === "ar" ? "ar" : "en");
  }, []);

  const t = useCallback((text, values) => translateText(text, language, values), [language]);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = language === "ar"
      ? "NOTELY — أفكارك، بكل ترتيب"
      : "NOTELY — Your thoughts, in order";
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = language === "ar"
        ? "مساحة هادئة لكل ملاحظاتك وأفكارك."
        : "A thoughtful home for all your notes.";
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider.");
  return context;
}
