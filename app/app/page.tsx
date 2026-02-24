// app/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import EntryCalendar from "../components/EntryCalendar";

function todayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

type EntryRow = {
  entry_date: string;
  reflection: string | null;
  plan_tomorrow: string | null;
  outfit: string | null;
  updated_at: string | null;
};

export default function AppPage() {
  const router = useRouter();

  // Auth/session
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Form (today)
  const [reflection, setReflection] = useState("");
  const [planTomorrow, setPlanTomorrow] = useState("");
  const [outfit, setOutfit] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [updated_at, setUpdatedAt] = useState<string | null>(null);

  // Calendar/history
  const [entriesByDate, setEntriesByDate] = useState<Record<string, EntryRow>>(
    {},
  );
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(null);

  const today = useMemo(() => todayISODate(), []);

  const selected = selectedIsoDate ? entriesByDate[selectedIsoDate] : null;
  const entryDatesSet = useMemo(
    () => new Set(Object.keys(entriesByDate)),
    [entriesByDate],
  );

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.push("/login");
        return;
      }

      setEmail(data.session.user.email ?? null);
      setUserId(data.session.user.id);

      const { data: entry, error: entryError } = await supabase
        .from("daily_entries")
        .select("reflection, plan_tomorrow, outfit, updated_at")
        .eq("entry_date", today)
        .maybeSingle();

      if (entryError) {
        console.error("Error fetching today's entry:", entryError);
      } else if (entry) {
        setUpdatedAt(entry.updated_at);
        setReflection(entry.reflection || "");
        setPlanTomorrow(entry.plan_tomorrow || "");
        setOutfit(entry.outfit || "");
        setAlreadySubmitted(true);
      }

      const { data: allEntries, error: allErr } = await supabase
        .from("daily_entries")
        .select("entry_date, reflection, plan_tomorrow, outfit, updated_at")
        .order("entry_date", { ascending: true });

      if (allErr) {
        console.error("Error fetching entries:", allErr);
      } else if (allEntries) {
        const map: Record<string, EntryRow> = {};
        for (const e of allEntries as EntryRow[]) map[e.entry_date] = e;
        setEntriesByDate(map);
      }

      setSelectedIsoDate((prev) => prev ?? today);

      setLoadingEntry(false);
      setCheckingSession(false);
    };

    run();
  }, [router, today]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async () => {
    setStatus("");

    if (!userId) {
      setStatus("Session missing. Please login again.");
      return;
    }

    if (!reflection.trim() || !planTomorrow.trim() || !outfit.trim()) {
      setStatus("Fill all 3 fields before submitting.");
      return;
    }

    setSubmitting(true);

    const nowIso = new Date().toISOString();

    const { error } = await supabase.from("daily_entries").upsert(
      {
        user_id: userId,
        entry_date: today,
        reflection,
        plan_tomorrow: planTomorrow,
        outfit,
        updated_at: nowIso,
      },
      { onConflict: "user_id,entry_date" },
    );

    setSubmitting(false);

    if (error) {
      setStatus(`Error: ${error.message}`);
      return;
    }

    setAlreadySubmitted(true);
    setUpdatedAt(nowIso);
    setStatus("Saved ✅");

    setEntriesByDate((prev) => ({
      ...prev,
      [today]: {
        entry_date: today,
        reflection,
        plan_tomorrow: planTomorrow,
        outfit,
        updated_at: nowIso,
      },
    }));

    setSelectedIsoDate(today);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-4 shadow-sm">
          <div className="text-sm text-zinc-300">Checking session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Background polish */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-12rem] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-14">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              Live MVP
            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Daily Pivot
            </h1>

            <p className="text-sm text-zinc-400">
              One entry a day. Keep the streak. Stay on path.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-xs text-zinc-500">Logged in</div>
              <div className="text-sm text-zinc-200 truncate max-w-[260px]">
                {email ?? ""}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200 shadow-sm hover:bg-zinc-900 transition">
              Logout
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: form card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-zinc-300">Today</div>
                  <div className="text-xs text-zinc-500 mt-1">{today}</div>
                </div>

                {alreadySubmitted ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                    Submitted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-zinc-400/60" />
                    Not submitted
                  </span>
                )}
              </div>
            </div>

            <div className="px-5 py-5 md:px-6 md:py-6 space-y-5">
              {loadingEntry && (
                <Banner tone="neutral" title="Loading">
                  Fetching today’s entry…
                </Banner>
              )}
              {status && (
                <Banner
                  tone={
                    status.toLowerCase().startsWith("error")
                      ? "danger"
                      : "neutral"
                  }
                  title="Status">
                  {status}
                </Banner>
              )}

              <Field
                title="Reflection"
                subtitle="What went well? What did you learn? What needs fixing?"
                value={reflection}
                onChange={setReflection}
                rows={4}
                placeholder="Write 3–6 lines. Keep it real."
              />

              <Field
                title="Tomorrow Plan"
                subtitle="Top 3 priorities. Make them concrete."
                value={planTomorrow}
                onChange={setPlanTomorrow}
                rows={4}
                placeholder="1) …  2) …  3) …"
              />

              <Field
                title="Outfit"
                subtitle="Decide now so tomorrow is frictionless."
                value={outfit}
                onChange={setOutfit}
                rows={2}
                placeholder="e.g., black pants + hoodie"
              />

              <div className="pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || loadingEntry}
                  className={[
                    "w-full rounded-xl px-4 py-3 text-sm font-medium transition",
                    "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
                    submitting || loadingEntry
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800"
                      : "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-600 text-white border border-blue-400/30",
                  ].join(" ")}>
                  {submitting
                    ? "Saving…"
                    : alreadySubmitted
                      ? "Save changes"
                      : "Submit"}
                </button>

                <p className="mt-1 text-xs text-zinc-600">
                  Last Saved:{" "}
                  {updated_at == null
                    ? "No entry today"
                    : new Date(updated_at).toLocaleTimeString()}
                </p>

                <p className="mt-3 text-xs text-zinc-500">
                  Tip: quality beats volume. Keep it short, honest, and
                  specific.
                </p>
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            <EntryCalendar
              entryDates={entryDatesSet}
              selectedIsoDate={selectedIsoDate}
              onSelectDate={(iso) => setSelectedIsoDate(iso)}
            />

            {selectedIsoDate ? (
              selected ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6">
                  <div className="text-sm font-medium">
                    Entry: {selectedIsoDate}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Last saved:{" "}
                    {selected.updated_at
                      ? new Date(selected.updated_at).toLocaleString()
                      : "—"}
                  </div>

                  <div className="mt-4 space-y-4 text-sm text-zinc-200">
                    <div>
                      <div className="text-xs text-zinc-400">Reflection</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {selected.reflection ?? ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Tomorrow Plan</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {selected.plan_tomorrow ?? ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Outfit</div>
                      <div className="mt-1 whitespace-pre-wrap">
                        {selected.outfit ?? ""}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6 text-sm text-zinc-300">
                  No entry for {selectedIsoDate}.
                </div>
              )
            ) : null}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6">
              <div className="text-sm font-medium">Account</div>
              <div className="mt-2 text-sm text-zinc-300 break-all">
                {email ?? ""}
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                MVP uses email + password. Later: reminders, streak rules,
                export.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-zinc-600">
          Daily Pivot • Built with Next.js + Supabase • Portfolio MVP
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder: string;
}) {
  const { title, subtitle, value, onChange, rows, placeholder } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-zinc-100">{title}</div>
          <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>
        </div>
        <div className="text-xs text-zinc-500 whitespace-nowrap">
          {value.length} chars
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition",
          "bg-zinc-950/40 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600",
        ].join(" ")}
      />
    </div>
  );
}

function Banner(props: {
  tone: "neutral" | "success" | "danger";
  title: string;
  children: React.ReactNode;
}) {
  const { tone, title, children } = props;

  const styles =
    tone === "success"
      ? "border-emerald-900/50 bg-emerald-950/35 text-emerald-200"
      : tone === "danger"
        ? "border-rose-900/50 bg-rose-950/35 text-rose-200"
        : "border-zinc-800 bg-zinc-950/40 text-zinc-200";

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles}`}>
      <div className="text-xs font-medium opacity-90">{title}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-500">{props.label}</div>
      <div className="text-sm text-zinc-200">{props.value}</div>
    </div>
  );
}
