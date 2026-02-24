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


  const missedDates: Date[] = [];
  for (
    let d = new Date(monthStart);
    d <= monthEnd;
    d.setDate(d.getDate() + 1)
  ) {
    const iso = toISODateLocal(d);
    const isFuture = d > today;
    if (!isFuture && !entryDates.has(iso)) missedDates.push(new Date(d));
  }

  const doneDates: Date[] = [];
  for (const iso of entryDates) doneDates.push(new Date(iso + "T00:00:00"));

  const selectedDateObj = selectedIsoDate
    ? new Date(selectedIsoDate + "T00:00:00")
    : undefined;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-sm font-medium text-zinc-100">Calendar</div>
      <div className="text-xs text-zinc-500 mt-1">
        Green = done • Red = missed • click a day to view
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
            done: doneDates,
            missed: missedDates,
          }}
          modifiersClassNames={{
            done: "dp-done",
            missed: "dp-missed",
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