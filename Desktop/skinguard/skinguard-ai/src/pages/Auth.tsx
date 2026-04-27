import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { Activity } from "lucide-react";

const Auth = () => {
  const { user, loading } = useAuth();
  const { lang } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => { document.title = `${t("signIn", lang)} — ${t("appName", lang)}`; }, [lang]);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success(lang === "en" ? "Welcome back!" : "Murakaza neza!"); navigate("/dashboard"); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error(lang === "en" ? "Password too short" : "Ijambo banga rigufi"); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { display_name: displayName || email.split("@")[0] } },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success(lang === "en" ? "Account created!" : "Konti yaremye!"); navigate("/dashboard"); }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <div className="container max-w-md py-12">
        <div className="text-center mb-8">
          <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold">{t("appName", lang)}</h1>
          <p className="text-muted-foreground mt-2">{t("tagline", lang)}</p>
        </div>

        <Card className="p-6 shadow-card">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">{t("signIn", lang)}</TabsTrigger>
              <TabsTrigger value="signup">{t("signUp", lang)}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t("email", lang)}</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password">{t("password", lang)}</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-hero" disabled={busy}>
                  {busy ? t("loading", lang) : t("signIn", lang)}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="dn">{t("displayName", lang)}</Label>
                  <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email2">{t("email", lang)}</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="password2">{t("password", lang)}</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-gradient-hero" disabled={busy}>
                  {busy ? t("loading", lang) : t("createAccount", lang)}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
