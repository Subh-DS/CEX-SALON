import DateStrip, { toISO } from "./DateStrip";

export function defaultDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + (d.getDay() === 6 ? 2 : 1));
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return toISO(d);
}

export default function StepDate({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-[26px] font-medium text-ink">Choose a date</h2>
      <p className="mt-1 text-[15px] text-ink/60">Sundays we're closed — every other day is bookable.</p>
      <div className="mt-5">
        <DateStrip value={date} onChange={setDate} />
      </div>
    </div>
  );
}
