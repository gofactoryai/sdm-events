export const STATUSES = [
  "New Order",
  "Dealer Setup Needed",
  "Ad Copy Needed",
  "Awaiting Client Approval",
  "Revisions Requested",
  "Approved",
  "Creative in Progress",
  "Ready to Schedule",
  "Scheduled",
  "Running",
  "Paused",
  "Completed",
  "Report Sent",
  "Cancelled",
] as const;

export type Status = (typeof STATUSES)[number];

// Row colors for the events grid (light background, dark text)
export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  "New Order": { bg: "#ffffff", fg: "#111827" },
  "Dealer Setup Needed": { bg: "#fde2e1", fg: "#991b1b" },
  "Ad Copy Needed": { bg: "#fef08a", fg: "#713f12" },
  "Awaiting Client Approval": { bg: "#fed7aa", fg: "#7c2d12" },
  "Revisions Requested": { bg: "#fdba74", fg: "#7c2d12" },
  Approved: { bg: "#e9d5ff", fg: "#581c87" },
  "Creative in Progress": { bg: "#ddd6fe", fg: "#4c1d95" },
  "Ready to Schedule": { bg: "#bfdbfe", fg: "#1e3a8a" },
  Scheduled: { bg: "#c7d7f5", fg: "#1e3a8a" },
  Running: { bg: "#86efac", fg: "#14532d" },
  Paused: { bg: "#f2a5a5", fg: "#7f1d1d" },
  Completed: { bg: "#e5e7eb", fg: "#374151" },
  "Report Sent": { bg: "#d1d5db", fg: "#1f2937" },
  Cancelled: { bg: "#f3f4f6", fg: "#9ca3af" },
};

export const CLOSED_STATUSES: string[] = ["Completed", "Report Sent", "Cancelled"];
// Statuses where the client can still edit the event details
export const CLIENT_EDITABLE_STATUSES: string[] = ["New Order", "Dealer Setup Needed", "Ad Copy Needed"];
// BDC only sees events that are about to run or are running
export const BDC_STATUSES: string[] = ["Scheduled", "Running", "Paused"];
// The retargeting team sees the same active events (regardless of who runs the chat)
export const RETARGETING_STATUSES: string[] = BDC_STATUSES;

export const EVENT_TYPES = ["Paid Ads", "Retargeting Only"];
// "Retargeting Only" can only be chosen by admin
export const CLIENT_EVENT_TYPES = ["Paid Ads"];

// Filled in by "+ Add most popular incentives" on the event form
export const POPULAR_INCENTIVES = [
  "As little as $0 down",
  "Rates as low as 0% APR",
  "You may qualify for No Payments for 90 Days",
  "Payments as low as $299/month",
  "Up to $4,000 over KBB for your trade",
];
export const HANDLED_BY = ["BDC", "CloseBot", "BDC + CloseBot"];

/** "CloseBot" is an internal term — everyone except admin sees "AI Bot". */
export function chatLabel(value: string | null | undefined, isAdmin: boolean): string {
  if (!value) return "";
  return isAdmin ? value : value.replace(/CloseBot/g, "AI Bot");
}

export const COPY_STATUS = { sent: "Sent to client", changes: "Changes requested", approved: "Approved" } as const;
export type CopyStatus = keyof typeof COPY_STATUS;

export const DAYS = [
  { key: "mon", label: "Mon", short: "M" },
  { key: "tue", label: "Tue", short: "T" },
  { key: "wed", label: "Wed", short: "W" },
  { key: "thu", label: "Thu", short: "Th" },
  { key: "fri", label: "Fri", short: "F" },
  { key: "sat", label: "Sat", short: "Sat" },
  { key: "sun", label: "Sun", short: "Sun" },
] as const;

export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern" },
  { value: "America/Chicago", label: "Central" },
  { value: "America/Denver", label: "Mountain" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
];

const ZONE_STATES: Record<string, string[]> = {
  "America/New_York": ["CT", "DE", "DC", "FL", "GA", "IN", "KY", "ME", "MD", "MA", "MI", "NH", "NJ", "NY", "NC", "OH", "PA", "RI", "SC", "VT", "VA", "WV"],
  "America/Chicago": ["AL", "AR", "IL", "IA", "KS", "LA", "MN", "MS", "MO", "NE", "ND", "OK", "SD", "TN", "TX", "WI"],
  "America/Denver": ["CO", "ID", "MT", "NM", "UT", "WY"],
  "America/Phoenix": ["AZ"],
  "America/Los_Angeles": ["CA", "NV", "OR", "WA"],
  "America/Anchorage": ["AK"],
  "Pacific/Honolulu": ["HI"],
};

const STATE_NAMES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO",
  connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
};

/** Oregon dealerships need Oregon-compliant ad copy. */
export function isOregon(state: string | null | undefined): boolean {
  const s = (state ?? "").trim().toLowerCase();
  return s === "or" || s === "oregon";
}

/** Default timezone for a state. Some states span two zones, so this is editable on the dealership. */
export function stateTimezone(state: string | null | undefined): string | null {
  if (!state) return null;
  const s = state.trim();
  const abbr = s.length === 2 ? s.toUpperCase() : STATE_NAMES[s.toLowerCase()];
  for (const [zone, states] of Object.entries(ZONE_STATES)) {
    if (abbr && states.includes(abbr)) return zone;
  }
  return null;
}
