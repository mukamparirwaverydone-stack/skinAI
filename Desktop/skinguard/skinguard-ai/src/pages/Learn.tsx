import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { Sun, Eye, Calendar, Sparkles, ShieldAlert } from "lucide-react";

const content = {
  en: {
    title: "Learn about skin cancer",
    intro: "Early detection saves lives. Knowing the warning signs and protecting your skin from the sun are the two most important steps you can take.",
    abcde: {
      title: "The ABCDE rule",
      desc: "Use these 5 features to evaluate any new or changing mole or skin spot:",
      items: [
        ["A — Asymmetry", "One half of the mole doesn't match the other."],
        ["B — Border", "Edges are irregular, ragged, notched, or blurred."],
        ["C — Color", "Color is not uniform — shades of brown, black, sometimes pink, red, white, or blue."],
        ["D — Diameter", "Larger than 6mm (about the size of a pencil eraser), though melanomas can be smaller."],
        ["E — Evolving", "The mole is changing in size, shape, color, or any new symptom (bleeding, itching)."],
      ],
    },
    prevention: {
      title: "Prevention tips",
      items: [
        { icon: Sun, title: "Use sunscreen daily", desc: "Broad-spectrum SPF 30+, reapply every 2 hours when outdoors." },
        { icon: Eye, title: "Self-examine monthly", desc: "Check your skin head-to-toe, including back, scalp, and feet." },
        { icon: Calendar, title: "Annual dermatologist visit", desc: "Especially if you have many moles or family history." },
        { icon: Sparkles, title: "Avoid tanning beds", desc: "They significantly raise your melanoma risk." },
        { icon: ShieldAlert, title: "Cover up", desc: "Hats, sunglasses, and protective clothing during peak sun hours (10am-4pm)." },
      ],
    },
    types: {
      title: "Common types",
      items: [
        ["Basal cell carcinoma (BCC)", "Most common skin cancer. Slow-growing, rarely spreads, usually appears on sun-exposed areas."],
        ["Squamous cell carcinoma (SCC)", "Second most common. Can grow deeper if untreated. Often firm red nodules or scaly patches."],
        ["Melanoma", "Less common but most dangerous. Can spread quickly. Early detection is critical."],
      ],
    },
  },
  rw: {
    title: "Wige kuri kanseri y'uruhu",
    intro: "Kumenya hakiri kare birokora ubuzima. Kumenya ibimenyetso no kurinda uruhu rwawe izuba ni intambwe ebyiri z'ingenzi.",
    abcde: {
      title: "Amategeko ya ABCDE",
      desc: "Koresha ibi bintu 5 mu gusuzuma ikibyimba gishya cyangwa kihinduka:",
      items: [
        ["A — Asymmetry (Kudahuza)", "Igice kimwe cy'ikibyimba ntigihuze ikindi."],
        ["B — Border (Inkombe)", "Inkombe zidasobanutse cyangwa zidasanzwe."],
        ["C — Color (Ibara)", "Ibara ritandukanye — kabukombe, umukara, gitukura, gitanze."],
        ["D — Diameter (Ubunini)", "Buruta milimetero 6 (nk'umutwe wa kalamu)."],
        ["E — Evolving (Bihinduka)", "Ikibyimba kirahindura ubunini, ibara cyangwa gitangira kuva."],
      ],
    },
    prevention: {
      title: "Inama z'ukwirinda",
      items: [
        { icon: Sun, title: "Kwisiga umuti urinda izuba", desc: "SPF 30+, ongera buri masaha 2 igihe uri hanze." },
        { icon: Eye, title: "Kwisuzuma buri kwezi", desc: "Reba uruhu rwawe rwose, harimo umugongo n'umutwe." },
        { icon: Calendar, title: "Sura umuganga buri mwaka", desc: "Cyane cyane niba ufite ibibyimba byinshi cyangwa amateka mu muryango." },
        { icon: Sparkles, title: "Wirinde ibikoresho byo guhindura ibara", desc: "Byongera ibyago bya melanoma." },
        { icon: ShieldAlert, title: "Wikingire", desc: "Ingofero, amadarubindi, n'imyenda mu masaha y'izuba (10h-16h)." },
      ],
    },
    types: {
      title: "Ubwoko bwa kanseri y'uruhu",
      items: [
        ["Basal cell carcinoma (BCC)", "Iboneka cyane. Ikura buhoro, gake ikwirakwira."],
        ["Squamous cell carcinoma (SCC)", "Iya kabiri mu kuboneka. Ishobora gukura cyane idakijijwe."],
        ["Melanoma", "Ntibiboneka cyane ariko ari mbi cyane. Ishobora gukwirakwira vuba."],
      ],
    },
  },
} as const;

const Learn = () => {
  const { lang } = useApp();
  const c = content[lang];

  useEffect(() => { document.title = `${t("learn", lang)} — ${t("appName", lang)}`; }, [lang]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 max-w-4xl space-y-8">
        <header>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{c.title}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{c.intro}</p>
        </header>

        <MedicalDisclaimer />

        <section>
          <h2 className="font-display text-2xl font-bold mb-2">{c.abcde.title}</h2>
          <p className="text-muted-foreground mb-4">{c.abcde.desc}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.abcde.items.map(([k, v]) => (
              <Card key={k} className="p-4 shadow-card">
                <div className="font-semibold text-primary">{k}</div>
                <p className="text-sm text-muted-foreground mt-1">{v}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold mb-4">{c.prevention.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.prevention.items.map((it) => (
              <Card key={it.title} className="p-5 shadow-card">
                <it.icon className="h-7 w-7 text-primary mb-3" />
                <div className="font-semibold">{it.title}</div>
                <p className="text-sm text-muted-foreground mt-1">{it.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold mb-4">{c.types.title}</h2>
          <div className="space-y-3">
            {c.types.items.map(([k, v]) => (
              <Card key={k} className="p-5 shadow-card">
                <div className="font-semibold">{k}</div>
                <p className="text-sm text-muted-foreground mt-1">{v}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Learn;
