import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { RiskResult } from "@/components/RiskResult";
import { toast } from "sonner";
import { Camera, Upload, Loader2, Image as ImageIcon } from "lucide-react";

interface Assessment {
  is_skin_lesion: boolean;
  classification: string;
  risk_level: "low" | "medium" | "high" | "unknown";
  confidence: number;
  findings: { asymmetry: string; border: string; color: string; diameter: string; other?: string };
  explanation: string;
  recommendation: string;
}

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const Analyze = () => {
  const { user } = useAuth();
  const { lang } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Assessment | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { document.title = `${t("analyze", lang)} — ${t("appName", lang)}`; }, [lang]);

  const onPick = async (f: File) => {
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Max 8MB"); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) onPick(f);
  };

  const reset = () => { setFile(null); setPreviewUrl(null); setResult(null); };

  const analyze = async () => {
    if (!file || !user) return;
    setAnalyzing(true);
    try {
      const dataUrl = await fileToBase64(file);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-lesion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType: file.type, language: lang }),
      });
      if (!resp.ok) {
        if (resp.status === 429) toast.error(lang === "en" ? "Too many requests, try later." : "Ibibazo byinshi, gerageza nyuma.");
        else if (resp.status === 402) toast.error(lang === "en" ? "AI credits exhausted." : "Inguzanyo za AI zashize.");
        else toast.error(`Analysis failed (${resp.status})`);
        return;
      }
      const a = (await resp.json()) as Assessment;
      setResult(a);

      // Upload image and save prediction
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("lesion-images").upload(path, file);
      if (upErr) console.error("upload error", upErr);

      const { error: insErr } = await supabase.from("predictions").insert({
        user_id: user.id,
        image_path: path,
        risk_level: a.risk_level,
        confidence: a.confidence,
        classification: a.classification,
        findings: a.findings,
        explanation: a.explanation,
        recommendation: a.recommendation,
      });
      if (insErr) console.error("insert error", insErr);
      else toast.success(t("saveResult", lang));
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("uploadTitle", lang)}</h1>
          <p className="text-muted-foreground mt-1">{t("uploadHint", lang)}</p>
        </div>

        <MedicalDisclaimer compact />

        {!previewUrl && (
          <Card
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`p-10 text-center border-2 border-dashed transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="grid place-items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{t("uploadHint", lang)}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="h-4 w-4 mr-2" />{t("chooseImage", lang)}
                </Button>
                <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                  <Camera className="h-4 w-4 mr-2" />{t("takePhoto", lang)}
                </Button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
          </Card>
        )}

        {previewUrl && (
          <Card className="p-4 shadow-card">
            <img src={previewUrl} alt="Lesion preview" className="rounded-lg max-h-96 mx-auto object-contain" />
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={reset} disabled={analyzing}>
                {lang === "en" ? "Choose different" : "Hindura"}
              </Button>
              {!result && (
                <Button onClick={analyze} disabled={analyzing} className="bg-gradient-hero">
                  {analyzing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {analyzing ? t("analyzing", lang) : t("analyze", lang)}
                </Button>
              )}
            </div>
          </Card>
        )}

        {result && (
          <>
            <RiskResult assessment={result} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={reset}>{t("reanalyze", lang)}</Button>
              <Button onClick={() => navigate("/history")}>{t("history", lang)}</Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analyze;
