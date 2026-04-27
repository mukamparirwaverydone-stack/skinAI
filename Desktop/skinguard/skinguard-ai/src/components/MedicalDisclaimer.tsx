import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  const { lang } = useApp();
  return (
    <div className={`flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm ${compact ? "py-3" : ""}`}>
      <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
      <p className="text-foreground/90 leading-relaxed">{t("disclaimer", lang)}</p>
    </div>
  );
}
