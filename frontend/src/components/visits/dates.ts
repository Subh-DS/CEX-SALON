const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export interface VisitDate {
  month: string;
  day: string;
  time: string;
  full: string;
}

export function parseVisitDate(iso: string): VisitDate {
  const d = new Date(iso);
  const hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
  return {
    month: MONTHS[d.getMonth()],
    day: String(d.getDate()).padStart(2, "0"),
    time,
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
  };
}

export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}
