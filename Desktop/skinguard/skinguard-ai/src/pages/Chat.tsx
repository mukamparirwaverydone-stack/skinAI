import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/i18n";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string; }

const Chat = () => {
  const { user } = useAuth();
  const { lang } = useApp();
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = `${t("chat", lang)} — ${t("appName", lang)}`; }, [lang]);

  // load or create conversation + history
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: convs } = await supabase
        .from("conversations").select("*").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(1);
      let id = convs?.[0]?.id;
      if (!id) {
        const { data: created } = await supabase.from("conversations")
          .insert({ user_id: user.id, title: "Skin health chat" }).select().single();
        id = created?.id;
      }
      setConvId(id ?? null);
      if (id) {
        const { data: msgs } = await supabase.from("chat_messages")
          .select("role,content").eq("conversation_id", id).order("created_at");
        setMessages((msgs as Msg[]) ?? []);
      }
    })();
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !user || !convId || streaming) return;
    const text = input.trim();
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: text });

    setStreaming(true);
    let acc = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skin-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });

      if (resp.status === 429) { toast.error(lang === "en" ? "Rate limit, try later." : "Gerageza nyuma."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error(lang === "en" ? "AI credits exhausted." : "Inguzanyo zashize."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Stream failed"); setStreaming(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = ""; let done = false;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      if (acc) await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: acc });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="container py-6 flex-1 flex flex-col max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-4">{t("chat", lang)}</h1>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-card">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[calc(100vh-260px)]">
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">{t("chatIntro", lang)}</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`grid h-8 w-8 place-items-center rounded-full shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>
                  {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm max-w-[80%] ${
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-border p-3 flex gap-2 bg-background"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder", lang)}
              disabled={streaming}
            />
            <Button type="submit" disabled={streaming || !input.trim()} className="bg-gradient-hero">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Chat;
