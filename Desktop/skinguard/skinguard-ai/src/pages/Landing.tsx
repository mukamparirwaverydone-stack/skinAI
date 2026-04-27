import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import heroImg from "@/assets/hero.jpg";
import { ScanLine, ShieldCheck, MessageCircle, Languages } from "lucide-react";

const Landing = () => {
  const { lang } = useApp();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="container py-20 sm:py-28 max-w-4xl">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
            {t("tagline", lang)}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
            {lang === "en" ? (
              <>Smart, gentle <span className="text-primary">skin checks</span> — anytime, anywhere.</>
            ) : (
              <>Isuzuma ry'<span className="text-primary">uruhu</span> ryihuse, igihe icyo aricyo cyose.</>
            )}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            {lang === "en"
              ? "Upload a photo of a mole or skin lesion. Our AI applies the ABCDE dermatology criteria to estimate risk and guide your next step."
              : "Ohereza ifoto y'ikibyimba cy'uruhu. AI yacu ikoresha amategeko ya ABCDE kugira ngo igereranye ibyago no kuyobora intambwe ikurikira."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-hero shadow-soft">
              <Link to="/auth">{t("createAccount", lang)}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/learn">{t("learn", lang)}</Link>
            </Button>
          </div>
          <div className="mt-10">
            <MedicalDisclaimer />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: ScanLine, title: lang === "en" ? "AI image analysis" : "Isesengura rya AI", desc: lang === "en" ? "ABCDE-based screening with confidence score." : "Isuzuma rishingiye kuri ABCDE." },
            { icon: ShieldCheck, title: lang === "en" ? "Private & secure" : "Bihishe & bizewe", desc: lang === "en" ? "Your images are private to your account." : "Amafoto yawe ni ayawe wenyine." },
            { icon: MessageCircle, title: lang === "en" ? "Smart assistant" : "Umufasha w'ubwenge", desc: lang === "en" ? "Ask anything about skin cancer & prevention." : "Baza ibyerekeye kanseri y'uruhu." },
            { icon: Languages, title: lang === "en" ? "EN & Kinyarwanda" : "Icyongereza & Ikinyarwanda", desc: lang === "en" ? "Designed for accessibility." : "Yagenewe abantu bose." },
          ].map((f, i) => (
            <Card key={i} className="p-6 shadow-card hover:shadow-soft transition-shadow">
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} {t("appName", lang)} — Educational tool, not a medical device.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
