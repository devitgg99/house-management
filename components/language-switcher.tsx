"use client";

import { useLanguage, Language } from "@/contexts/language-context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "kh" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
      title={t.language}
    >
      <Globe className="w-5 h-5" />
      <span className="flex-1 text-left">
        {language === "en" ? "🇺🇸 English" : "🇰🇭 ខ្មែរ"}
      </span>
    </button>
  );
}

// Compact version for mobile header or other places
export function LanguageSwitcherCompact() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "kh" : "en")}
      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      title="Switch language"
    >
      <span className="text-lg">{language === "en" ? "🇺🇸" : "🇰🇭"}</span>
    </button>
  );
}

