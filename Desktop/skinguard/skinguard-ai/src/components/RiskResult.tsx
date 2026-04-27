import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle, Stethoscope } from "lucide-react";

interface Assessment {
  is_skin_lesion: boolean;
  classification: string;
  risk_level: "low" | "medium" | "high" | "unknown";
  confidence: number;
  findings: { asymmetry: string; border: string; color: string; diameter: string; other?: string };
  explanation: string;
  recommendation: string;
}

const RISK_CONFIG = {
  low: { gradient: "bg-gradient-to-br from-success to-emerald-500", icon: CheckCircle2, ring: "ring-success/30" },
  medium: { gradient: "bg-gradient-to-br from-warning to-orange-500", icon: AlertTriangle, ring: "ring-warning/30" },
  high: { gradient: "bg-gradient-to-br from-danger to-rose-500", icon: AlertCircle, ring: "ring-danger/30" },
  unknown: { gradient: "bg-gradient-to-br from-muted-foreground to-slate-500", icon: HelpCircle, ring: "ring-muted-foreground/30" },
} as const;

export function RiskResult({ assessment }: { assessment: Assessment }) {
  const { lang } = useApp();
  const cfg = RISK_CONFIG[assessment.risk_level];
  const Icon = cfg.icon;
  const riskLabel =
    assessment.risk_level === "low" ? t("riskLow", lang)
    : assessment.risk_level === "medium" ? t("riskMedium", lang)
    : assessment.risk_level === "high" ? t("riskHigh", lang)
    : t("riskUnknown", lang);

  return (
    <Card className={`overflow-hidden shadow-card ring-1 ${cfg.ring} animate-fade-in`}>
      <div className={`${cfg.gradient} p-6 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white/80 text-sm font-medium">{t("result", lang)}</div>
            <div className="font-display text-3xl font-bold mt-1">{riskLabel}</div>
            <div className="text-white/90 mt-2">{assessment.classification}</div>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>{t("confidence", lang)}</span>
            <span>{Math.round((assessment.confidence ?? 0) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.round((assessment.confidence ?? 0) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <h3 className="font-semibold mb-2">{t("explanation", lang)}</h3>
          <p className="text-sm text-foreground/90 leading-relaxed">{assessment.explanation}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">{t("findings", lang)}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["A — Asymmetry", assessment.findings.asymmetry],
              ["B — Border", assessment.findings.border],
              ["C — Color", assessment.findings.color],
              ["D — Diameter", assessment.findings.diameter],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted/60 p-3">
                <div className="text-xs font-semibold text-muted-foreground">{k}</div>
                <div className="text-sm mt-1">{v}</div>
              </div>
            ))}
            {assessment.findings.other && (
              <div className="rounded-lg bg-muted/60 p-3 sm:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground">Other</div>
                <div className="text-sm mt-1">{assessment.findings.other}</div>
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-4 ${
          assessment.risk_level === "high" ? "border-danger/40 bg-danger/5"
          : assessment.risk_level === "medium" ? "border-warning/40 bg-warning/5"
          : "border-primary/30 bg-primary/5"
        }`}>
          <div className="flex gap-3">
            <Stethoscope className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">{t("recommendation", lang)}</h3>
              <p className="text-sm leading-relaxed">{assessment.recommendation}</p>
              {(assessment.risk_level === "medium" || assessment.risk_level === "high") && (
                <Badge variant="outline" className="mt-3">{t("consultDoctor", lang)}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
