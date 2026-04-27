import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, ImageOff } from "lucide-react";

interface Pred {
  id: string;
  image_path: string;
  risk_level: "low" | "medium" | "high" | "unknown";
  confidence: number;
  classification: string;
  explanation: string;
  recommendation: string;
  created_at: string;
}

const riskColor = (r: string) =>
  r === "low" ? "bg-success text-white"
  : r === "medium" ? "bg-warning text-white"
  : r === "high" ? "bg-danger text-white"
  : "bg-muted text-foreground";

const History = () => {
  const { user } = useAuth();
  const { lang } = useApp();
  const [items, setItems] = useState<Pred[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = `${t("history", lang)} — ${t("appName", lang)}`; }, [lang]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("predictions").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    setItems((data as Pred[]) ?? []);
    if (data) {
      const map: Record<string, string> = {};
      await Promise.all(data.map(async (p: any) => {
        const { data: signed } = await supabase.storage.from("lesion-images").createSignedUrl(p.image_path, 3600);
        if (signed?.signedUrl) map[p.id] = signed.signedUrl;
      }));
      setUrls(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (p: Pred) => {
    await supabase.storage.from("lesion-images").remove([p.image_path]);
    const { error } = await supabase.from("predictions").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success(lang === "en" ? "Deleted" : "Byasibwe"); load(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        <h1 className="font-display text-3xl font-bold">{t("history", lang)}</h1>

        {loading ? (
          <p className="text-muted-foreground">{t("loading", lang)}</p>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <ImageOff className="h-10 w-10 mx-auto mb-3 opacity-60" />
            {t("noHistory", lang)}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((p) => (
              <Card key={p.id} className="p-4 shadow-card overflow-hidden">
                <div className="flex gap-4">
                  {urls[p.id] ? (
                    <img src={urls[p.id]} alt="" loading="lazy" className="h-24 w-24 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-muted shrink-0 grid place-items-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={riskColor(p.risk_level)}>
                        {p.risk_level === "low" ? t("riskLow", lang) : p.risk_level === "medium" ? t("riskMedium", lang) : p.risk_level === "high" ? t("riskHigh", lang) : t("riskUnknown", lang)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{Math.round((p.confidence ?? 0) * 100)}%</span>
                    </div>
                    <div className="font-semibold mt-1 truncate">{p.classification}</div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.explanation}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
