import { db } from "./db";
import { isOregon } from "./constants";
import { hoursSummary, tzAbbr } from "./format";

export type Client = { id: number; name: string; brand_name: string | null; brand_color: string | null };

export type Dealership = {
  id: number;
  client_id: number;
  name: string;
  auto_brand: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  new_inventory_url: string | null;
  used_inventory_url: string | null;
  finance_url: string | null;
  crm_lead_email: string | null;
  xml_lead_email: string | null;
  timezone: string | null;
  hours_mon: string | null;
  hours_tue: string | null;
  hours_wed: string | null;
  hours_thu: string | null;
  hours_fri: string | null;
  hours_sat: string | null;
  hours_sun: string | null;
  ask_for: string | null;
  contacts: string | null;
  notes: string | null;
  ghl_done: number;
  closebot_done: number;
  setup_notes: string | null;
  created_at: string;
};

export type EventRow = {
  id: number;
  number: string;
  dealership_id: number;
  start_date: string | null;
  end_date: string | null;
  event_type: string;
  status: string;
  handled_by: string;
  budget: number | null;
  holiday_hours: string | null;
  incentives: string | null;
  client_notes: string | null;
  internal_notes: string | null;
  meta_notes: string | null;
  ad_copy_url: string | null;
  images_url: string | null;
  retargeting_url: string | null;
  copy_status: string | null;
  share_token: string | null;
  report_file: string | null;
  report_filename: string | null;
  report_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventListRow = EventRow & {
  dealer_name: string;
  client_id: number;
  client_name: string;
};

export const listClients = () => db.prepare("SELECT * FROM clients ORDER BY name").all() as Client[];
export const getClient = (id: number) => db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as Client | undefined;

export function listDealerships(clientId?: number) {
  const sql = `SELECT d.*, c.name AS client_name,
      (SELECT COUNT(*) FROM events e WHERE e.dealership_id = d.id) AS event_count
    FROM dealerships d JOIN clients c ON c.id = d.client_id
    ${clientId ? "WHERE d.client_id = ?" : ""} ORDER BY d.name`;
  const stmt = db.prepare(sql);
  return (clientId ? stmt.all(clientId) : stmt.all()) as (Dealership & { client_name: string; event_count: number })[];
}

/** What the event form needs to show and pre-fill from a dealership. */
export type DealerOption = {
  id: number;
  name: string;
  street: string | null;
  cityLine: string;
  phone: string | null;
  website: string | null;
  ask_for: string | null;
  oregon: boolean;
  hours: string[];
};

export function listDealerOptions(clientId?: number): DealerOption[] {
  return listDealerships(clientId).map((d) => ({
    id: d.id,
    name: d.name,
    street: d.street,
    cityLine: [d.city, [d.state, d.zip].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    phone: d.phone,
    website: d.website,
    ask_for: d.ask_for,
    oregon: isOregon(d.state),
    hours: hoursSummary(d, tzAbbr(d.timezone)),
  }));
}

export const getDealership = (id: number) =>
  db.prepare("SELECT * FROM dealerships WHERE id = ?").get(id) as Dealership | undefined;

const EVENT_LIST_SQL = `
  SELECT e.*, d.name AS dealer_name, d.client_id, c.name AS client_name
  FROM events e
  JOIN dealerships d ON d.id = e.dealership_id
  JOIN clients c ON c.id = d.client_id`;

export function listEvents(opts: { clientId?: number; dealershipId?: number } = {}) {
  const where: string[] = [];
  const args: number[] = [];
  if (opts.clientId) {
    where.push("d.client_id = ?");
    args.push(opts.clientId);
  }
  if (opts.dealershipId) {
    where.push("e.dealership_id = ?");
    args.push(opts.dealershipId);
  }
  const sql = `${EVENT_LIST_SQL} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY e.start_date, e.number`;
  return db.prepare(sql).all(...args) as EventListRow[];
}

export const getEvent = (id: number) =>
  db.prepare(`${EVENT_LIST_SQL} WHERE e.id = ?`).get(id) as EventListRow | undefined;

export const getEventByToken = (token: string) =>
  db.prepare(`${EVENT_LIST_SQL} WHERE e.share_token = ?`).get(token) as EventListRow | undefined;

export function nextEventNumber(): string {
  const rows = db.prepare("SELECT number FROM events WHERE number LIKE 'FB%'").all() as { number: string }[];
  const max = rows.reduce((m, r) => Math.max(m, parseInt(r.number.replace(/^FB/, ""), 10) || 0), 1000);
  return `FB${max + 1}`;
}

/** Short ad-copy state for grids and lists */
export function copyState(e: Pick<EventRow, "copy_status" | "ad_copy_url" | "event_type">): string {
  if (e.event_type === "Retargeting Only") return "—";
  if (e.copy_status === "approved") return "Approved";
  if (e.copy_status === "sent") return "Awaiting client";
  if (e.copy_status === "changes") return "Changes requested";
  return e.ad_copy_url ? "Draft" : "—";
}
