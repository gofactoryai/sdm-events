import { DAYS } from "./constants";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "Nov 2 - 7" or "Oct 26 - Nov 1" */
export function fmtRange(start: string | null, end: string | null): string {
  const a = parse(start);
  const b = parse(end);
  if (!a) return "";
  const aStr = `${MONTHS[a.getUTCMonth()]} ${a.getUTCDate()}`;
  if (!b) return aStr;
  if (a.getUTCMonth() === b.getUTCMonth()) return `${aStr} - ${b.getUTCDate()}`;
  return `${aStr} - ${MONTHS[b.getUTCMonth()]} ${b.getUTCDate()}`;
}

/** "Oct 19 - Oct 24, 2026" */
export function fmtCampaignRange(start: string | null, end: string | null): string {
  const a = parse(start);
  const b = parse(end);
  if (!a) return "";
  const aStr = `${MONTHS[a.getUTCMonth()]} ${a.getUTCDate()}`;
  if (!b) return `${aStr}, ${a.getUTCFullYear()}`;
  return `${aStr} - ${MONTHS[b.getUTCMonth()]} ${b.getUTCDate()}, ${b.getUTCFullYear()}`;
}

/** "Monday, October 26, 2026" */
export function fmtLong(s: string | null): string {
  const d = parse(s);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function ordinal(n: number): string {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "OCTOBER 19TH - OCTOBER 24TH" — used in ad copy */
export function fmtAdRange(start: string | null, end: string | null): string {
  const a = parse(start);
  const b = parse(end);
  if (!a) return "";
  const m = (d: Date) => d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }).toUpperCase();
  const aStr = `${m(a)} ${ordinal(a.getUTCDate())}`;
  return b ? `${aStr} - ${m(b)} ${ordinal(b.getUTCDate())}` : aStr;
}

export function fmtDateTime(s: string | null): string {
  if (!s) return "";
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function money(n: number | null | undefined): string {
  if (n == null) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** "EDT" / "MST" for the zone on the event date */
export function tzAbbr(zone: string | null, onDate?: string | null): string {
  if (!zone) return "";
  try {
    const d = parse(onDate ?? null) ?? new Date();
    const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName");
    return part?.value ?? "";
  } catch {
    return "";
  }
}

/** Groups matching days: ["M-F: 8am-6pm EDT", "Sat: 9am-6pm EDT", "Sun: Closed"] */
export function hoursSummary(row: Record<string, unknown>, abbr: string): string[] {
  const vals = DAYS.map((d) => ((row[`hours_${d.key}`] as string | null) ?? "").trim());
  if (vals.every((v) => !v)) return [];
  const lines: string[] = [];
  let i = 0;
  while (i < DAYS.length) {
    let j = i;
    while (j + 1 < DAYS.length && vals[j + 1] === vals[i]) j++;
    const label = i === j ? DAYS[i].label : `${DAYS[i].short}-${DAYS[j].short}`;
    const v = vals[i] || "—";
    const closed = /closed/i.test(v) || v === "—";
    lines.push(`${label}: ${v}${closed || !abbr ? "" : ` ${abbr}`}`);
    i = j + 1;
  }
  return lines;
}

export function lines(s: string | null | undefined): string[] {
  return (s ?? "").split("\n").map((l) => l.replace(/^[\s•●\-*]+/, "").trim()).filter(Boolean);
}
