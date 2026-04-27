export type Lang = "en" | "rw";

type Dict = Record<string, { en: string; rw: string }>;

const dict: Dict = {
  appName: { en: "SkinGuard AI", rw: "SkinGuard AI" },
  tagline: { en: "AI-powered skin lesion risk screening", rw: "Isuzuma ry'ibibyimba by'uruhu rikoresha AI" },
  signIn: { en: "Sign in", rw: "Injira" },
  signUp: { en: "Sign up", rw: "Iyandikishe" },
  signOut: { en: "Sign out", rw: "Sohoka" },
  email: { en: "Email", rw: "Imeli" },
  password: { en: "Password", rw: "Ijambo banga" },
  displayName: { en: "Display name", rw: "Izina ryawe" },
  createAccount: { en: "Create account", rw: "Fungura konti" },
  alreadyHaveAccount: { en: "Already have an account?", rw: "Usanzwe ufite konti?" },
  noAccount: { en: "No account yet?", rw: "Nta konti ufite?" },
  dashboard: { en: "Dashboard", rw: "Ikibaho" },
  analyze: { en: "Analyze", rw: "Suzuma" },
  history: { en: "History", rw: "Amateka" },
  chat: { en: "Assistant", rw: "Umufasha" },
  learn: { en: "Learn", rw: "Wige" },
  uploadTitle: { en: "Upload a skin lesion image", rw: "Ohereza ifoto y'ikibyimba cy'uruhu" },
  uploadHint: { en: "Drag & drop, click to browse, or use your camera", rw: "Kanda hano cyangwa kura ifoto" },
  analyzing: { en: "Analyzing image…", rw: "Turi gusuzuma ifoto…" },
  result: { en: "Result", rw: "Igisubizo" },
  riskLow: { en: "Low risk", rw: "Ibyago bike" },
  riskMedium: { en: "Medium risk", rw: "Ibyago byo hagati" },
  riskHigh: { en: "High risk", rw: "Ibyago byinshi" },
  riskUnknown: { en: "Unclear", rw: "Ntibisobanutse" },
  confidence: { en: "Confidence", rw: "Icyizere" },
  findings: { en: "Findings (ABCDE)", rw: "Ibyabonetse (ABCDE)" },
  explanation: { en: "Explanation", rw: "Ibisobanuro" },
  recommendation: { en: "Recommendation", rw: "Inama" },
  disclaimer: {
    en: "This tool is for educational screening only and is NOT a medical diagnosis. Always consult a qualified dermatologist for any concerns.",
    rw: "Iki gikoresho ni icy'uburezi gusa, si ubuvuzi. Hora ubaza umuganga w'inzobere ku buzima bw'uruhu igihe cyose ufite impungenge.",
  },
  chooseImage: { en: "Choose image", rw: "Hitamo ifoto" },
  takePhoto: { en: "Take photo", rw: "Fata ifoto" },
  reanalyze: { en: "Analyze another", rw: "Suzuma indi" },
  saveResult: { en: "Result saved to your history.", rw: "Ibisubizo byabitswe mu mateka yawe." },
  noHistory: { en: "No saved analyses yet.", rw: "Nta sesengura wabitse." },
  delete: { en: "Delete", rw: "Siba" },
  send: { en: "Send", rw: "Ohereza" },
  chatPlaceholder: { en: "Ask about skin cancer, prevention, ABCDE…", rw: "Baza ku kanseri y'uruhu, kwirinda, ABCDE…" },
  chatIntro: {
    en: "Hi! I'm your skin health assistant. Ask me anything about skin cancer prevention, warning signs, or your results.",
    rw: "Muraho! Ndi umufasha wawe. Mbaza ibijyanye no kwirinda kanseri y'uruhu cyangwa ibimenyetso byayo.",
  },
  language: { en: "Language", rw: "Ururimi" },
  theme: { en: "Theme", rw: "Insanganyamatsiko" },
  light: { en: "Light", rw: "Urumuri" },
  dark: { en: "Dark", rw: "Umwijima" },
  systemArchitecture: { en: "How it works", rw: "Uburyo bikora" },
  consultDoctor: { en: "Consult a dermatologist", rw: "Sura umuganga w'uruhu" },
  loading: { en: "Loading…", rw: "Birapakira…" },
};

export function t(key: keyof typeof dict, lang: Lang) {
  return dict[key]?.[lang] ?? dict[key]?.en ?? String(key);
}
