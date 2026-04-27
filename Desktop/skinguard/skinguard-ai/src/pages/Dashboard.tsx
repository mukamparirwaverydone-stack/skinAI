import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { ScanLine, History, MessageCircle, BookOpen } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { lang } = useApp();
  const [stats, setStats] = useState({ total: 0, low: 0, medium: 0, high: 0 });
  const [name, setName] = useState("");

  useEffect(() => {
    document.title = `${t("dashboard", lang)} — ${t("appName", lang)}`;
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle();
      if (prof?.display_name) setName(prof.display_name);
      const { data: preds } = await supabase.from("predictions").select("risk_level").eq("user_id", user.id);
      if (preds) {
        setStats({
          total: preds.length,
          low: preds.filter((p) => p.risk_level === "low").length,
          medium: preds.filter((p) => p.risk_level === "medium").length,
          high: preds.filter((p) => p.risk_level === "high").length,
        });
      }
    })();
  }, [user, lang]);

  const tiles = [
    { to: "/analyze", icon: ScanLine, label: t("analyze", lang), gradient: "bg-gradient-hero" },
    { to: "/history", icon: History, label: t("history", lang) },
    { to: "/chat", icon: MessageCircle, label: t("chat", lang) },
    { to: "/learn", icon: BookOpen, label: t("learn", lang) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            {lang === "en" ? `Hi, ${name || "there"} 👋` : `Muraho ${name || ""} 👋`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "en" ? "Your skin health overview." : "Incamake y'ubuzima bw'uruhu rwawe."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: lang === "en" ? "Total scans" : "Isesengura ryose", value: stats.total, color: "text-primary" },
            { label: t("riskLow", lang), value: stats.low, color: "text-success" },
            { label: t("riskMedium", lang), value: stats.medium, color: "text-warning" },
            { label: t("riskHigh", lang), value: stats.high, color: "text-danger" },
          ].map((s) => (
            <Card key={s.label} className="p-5 shadow-card">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link key={tile.to} to={tile.to}>
              <Card className={`p-6 shadow-card hover:shadow-soft transition-all hover:-translate-y-0.5 cursor-pointer h-full ${tile.gradient ? "text-primary-foreground " + tile.gradient : ""}`}>
                <tile.icon className={`h-8 w-8 mb-3 ${tile.gradient ? "" : "text-primary"}`} />
                <div className="font-semibold text-lg">{tile.label}</div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="p-6 shadow-card bg-gradient-soft border-primary/20">
          <h2 className="font-display font-semibold text-xl mb-2">
            {lang === "en" ? "Ready for a check?" : "Witeguye gusuzuma?"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {lang === "en" ? "Upload a clear, well-lit photo of the lesion." : "Ohereza ifoto isobanutse y'ikibyimba."}
          </p>
          <Button asChild size="lg" className="bg-gradient-hero">
            <Link to="/analyze">{t("analyze", lang)}</Link>
          </Button>
        </Card>

        <MedicalDisclaimer />
      </main>
    </div>
  );
};

export default Dashboard;
