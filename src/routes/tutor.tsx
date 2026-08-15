import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send, Sparkles, Trash2, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AppShell, Card, PageHeader } from "@/components/AppShell";
import { tutorReply, tutorSuggestions } from "@/lib/tutor";
import { uid, useChat, useProfile } from "@/lib/store";

export const Route = createFileRoute("/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — Study Sync" }] }),
  component: Tutor,
});

function Tutor() {
  const [profile] = useProfile();
  const [messages, setMessages] = useChat();
  const [question, setQuestion] = useState("");

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    const answer = tutorReply(q, profile?.name);
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", text: q },
      { id: uid(), role: "tutor", text: answer },
    ]);
    setQuestion("");
  }

  function submit(e: FormEvent) { e.preventDefault(); ask(question); }

  return (
    <AppShell>
      <PageHeader eyebrow="Study assistant" title="AI Tutor" subtitle="Ask a question and get an instant, step-by-step study explanation." action={messages.length ? <button onClick={() => setMessages([])} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /> Clear</button> : undefined} />
      <Card className="mx-auto max-w-4xl">
        <div className="flex items-start gap-3 rounded-2xl bg-primary/10 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Bot className="h-5 w-5" /></span>
          <div><p className="font-bold">Study Sync Tutor</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Works offline in your browser. Try maths, physics, chemistry, biology, or ask for a study plan.</p></div>
        </div>

        <div className="mt-5 grid gap-3">
          {messages.length === 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {tutorSuggestions.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-xl border border-border bg-secondary/40 p-3 text-left text-sm font-semibold hover:border-primary/40"><Sparkles className="mr-2 inline h-4 w-4 text-primary" />{s}</button>)}
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/60"}`}>
                <div className="mb-1 text-xs font-bold opacity-70">{m.role === "user" ? <><User className="mr-1 inline h-3.5 w-3.5" />You</> : <><Bot className="mr-1 inline h-3.5 w-3.5" />Tutor</>}</div>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask: solve 3x + 5 = 20…" className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary" />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground"><Send className="h-4 w-4" /> Ask</button>
        </form>
      </Card>
    </AppShell>
  );
}
