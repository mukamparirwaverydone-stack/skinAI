import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

type Theme = "light" | "dark";

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("sg_lang") as Lang) || "en");
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("sg_theme") as Theme | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sg_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("sg_lang", lang);
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState, theme, setTheme: setThemeState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
