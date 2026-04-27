import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { user } = useAuth();
  const { lang, setLang, theme, setTheme } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = user
    ? [
        { to: "/dashboard", label: t("dashboard", lang) },
        { to: "/analyze", label: t("analyze", lang) },
        { to: "/history", label: t("history", lang) },
        { to: "/chat", label: t("chat", lang) },
        { to: "/learn", label: t("learn", lang) },
      ]
    : [{ to: "/learn", label: t("learn", lang) }];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Activity className="h-5 w-5" />
          </span>
          <span>{t("appName", lang)}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-medium uppercase">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("rw")}>Kinyarwanda</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" className="hidden sm:inline-flex">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">{t("signIn", lang)}</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container flex flex-col py-2">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-sm font-medium ${
                    isActive ? "bg-secondary" : "text-muted-foreground"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {user ? (
              <Button variant="ghost" onClick={handleSignOut} className="justify-start mt-2">
                <LogOut className="h-4 w-4 mr-2" /> {t("signOut", lang)}
              </Button>
            ) : (
              <Button asChild className="mt-2">
                <Link to="/auth" onClick={() => setOpen(false)}>{t("signIn", lang)}</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
