import { createFileRoute } from "@tanstack/react-router";
import { Bell, BellOff, Check, Clock3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AppShell, Card, PageHeader } from "@/components/AppShell";
import { notifyHabit, requestReminderPermission, reminderPermission, uid, useHabits, useProfile, useDailyReminderNotifications, type Habit } from "@/lib/store";

export const Route = createFileRoute("/routine")({
  head: () => ({ meta: [{ title: "Routine — Study Sync" }] }),
  component: Routine,
});

function Routine() {
  const [profile] = useProfile();
  const [habits, setHabits] = useHabits();
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("18:00");
  const [kind, setKind] = useState<Habit["kind"]>("routine");
  const [permission, setPermission] = useState(reminderPermission());

  useDailyReminderNotifications(habits, Boolean(profile?.prayerReminders) || permission === "granted");

  useEffect(() => {
    const onFocus = () => setPermission(reminderPermission());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function addHabit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setHabits((prev) => [...prev, { id: uid(), title: title.trim(), kind, time, done: false }].sort((a,b) => a.time.localeCompare(b.time)));
    setTitle("");
    toast.success("Routine item added");
  }

  async function enableNotifications() {
    const result = await requestReminderPermission();
    setPermission(result);
    if (result === "granted") toast.success("Daily browser reminders enabled");
    else if (result === "denied") toast.error("Notifications are blocked in your browser settings");
    else toast.error("This browser does not support notifications");
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Daily routine" title="Routine & reminders" subtitle="Build a simple routine and get browser reminders while Study Sync is open." action={<button onClick={enableNotifications} className="inline-flex items-center gap-2 rounded-xl bg-primary/15 px-3 py-2 text-xs font-bold text-primary">{permission === "granted" ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}{permission === "granted" ? "Reminders on" : "Enable reminders"}</button>} />

      <Card className="mb-4">
        <form onSubmit={addHabit} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Routine item (e.g. Revise Biology)" className="rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <select value={kind} onChange={(e) => setKind(e.target.value as Habit["kind"])} className="rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="routine">Routine</option><option value="exercise">Exercise</option><option value="prayer">Prayer</option><option value="custom">Custom</option></select>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <button className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
        </form>
      </Card>

      <div className="grid gap-3">
        {habits.map((habit) => (
          <Card key={habit.id} className="p-3.5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3">
              <button onClick={() => setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, done: !h.done } : h))} className={`grid h-7 w-7 place-items-center rounded-lg border ${habit.done ? "border-transparent bg-gradient-primary" : "border-border hover:border-primary"}`} aria-label={habit.done ? "Mark incomplete" : "Mark complete"}>{habit.done && <Check className="h-4 w-4 text-primary-foreground" />}</button>
              <div className="min-w-0"><p className={`truncate text-sm font-bold ${habit.done ? "text-muted-foreground line-through" : ""}`}>{habit.title}</p><p className="text-xs capitalize text-muted-foreground">{habit.kind}</p></div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{habit.time}</span>
              <div className="flex gap-1"><button onClick={() => { if (permission === "granted") { notifyHabit(habit); toast.success("Test reminder sent"); } else enableNotifications(); }} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" title="Test reminder"><Bell className="h-4 w-4" /></button><button onClick={() => setHabits((prev) => prev.filter((h) => h.id !== habit.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Daily browser notifications require permission and the app to be open. For reminders when the site is completely closed, a push-notification service/backend is required.</p>
    </AppShell>
  );
}
