"use client";

import { DayPicker } from "react-day-picker";

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type EntryCalendarProps = {
  entryDates: Set<string>; 
  onSelectDate: (isoDate: string) => void;
  selectedIsoDate?: string | null;
};

export default function EntryCalendar({
  entryDates,
  onSelectDate,
  selectedIsoDate,
}: EntryCalendarProps) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);


  const missedDates = new Set<string>();
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const iso = toISODateLocal(d);
    const isFuture = d > today;
    if (!isFuture && !entryDates.has(iso)) missedDates.add(iso);
  }

  const selectedDateObj = selectedIsoDate
    ? new Date(selectedIsoDate + "T00:00:00")
    : undefined;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-sm font-medium text-zinc-100">Calendar</div>
      <div className="text-xs text-zinc-500 mt-1">
        🔥 done • 😔 missed • click a day to view
      </div>

      <div className="mt-3">
        <DayPicker
          mode="single"
          selected={selectedDateObj}
          onSelect={(d) => {
            if (!d) return;
            onSelectDate(toISODateLocal(d));
          }}
          modifiers={{
            done: (date) => entryDates.has(toISODateLocal(date)),
            missed: (date) => missedDates.has(toISODateLocal(date)),
          }}
          modifiersClassNames={{
            done: "dp-done",
            missed: "dp-missed",
          }}
          components={{
            DayContent: (props) => {
              const iso = toISODateLocal(props.date);
              const isDone = entryDates.has(iso);
              const isMissed = missedDates.has(iso);

              return (
                <div className="relative">
                  <span>{props.date.getDate()}</span>
                  {isDone ? (
                    <span className="absolute -top-2 -right-2 text-xs">🔥</span>
                  ) : isMissed ? (
                    <span className="absolute -top-2 -right-2 text-xs">😔</span>
                  ) : null}
                </div>
              );
            },
          }}
        />
      </div>

      <style jsx global>{`
        .dp-done {
          background: rgba(16, 185, 129, 0.18) !important;
          border-radius: 10px;
        }
        .dp-missed {
          background: rgba(244, 63, 94, 0.12) !important;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}