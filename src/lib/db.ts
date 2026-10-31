import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  brand_name TEXT,
  brand_color TEXT DEFAULT '#1d4ed8'
);

CREATE TABLE IF NOT EXISTS dealerships (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  auto_brand TEXT,
  street TEXT, city TEXT, state TEXT, zip TEXT,
  phone TEXT,
  website TEXT, new_inventory_url TEXT, used_inventory_url TEXT, finance_url TEXT,
  crm_lead_email TEXT, xml_lead_email TEXT,
  timezone TEXT,
  hours_mon TEXT, hours_tue TEXT, hours_wed TEXT, hours_thu TEXT, hours_fri TEXT, hours_sat TEXT, hours_sun TEXT,
  ask_for TEXT,
  contacts TEXT,
  notes TEXT,
  ghl_done INTEGER NOT NULL DEFAULT 0,
  closebot_done INTEGER NOT NULL DEFAULT 0,
  setup_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  dealership_id INTEGER NOT NULL REFERENCES dealerships(id),
  start_date TEXT, end_date TEXT,
  event_type TEXT NOT NULL DEFAULT 'Paid Ads',
  status TEXT NOT NULL DEFAULT 'New Order',
  handled_by TEXT NOT NULL DEFAULT 'BDC',
  budget REAL,
  holiday_hours TEXT,
  incentives TEXT,
  client_notes TEXT,
  internal_notes TEXT,
  meta_notes TEXT,
  ad_copy_url TEXT,
  images_url TEXT,
  retargeting_url TEXT,
  copy_status TEXT, -- sent | changes | approved
  share_token TEXT UNIQUE,
  report_file TEXT,
  report_filename TEXT,
  report_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

/** Brings databases created by earlier builds up to the current schema. */
function migrate(conn: Database.Database) {
  const cols = (t: string) => (conn.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]).map((c) => c.name);
  const ev = cols("events");
  for (const c of ["ad_copy_url", "images_url", "copy_status", "retargeting_url"]) if (!ev.includes(c)) conn.exec(`ALTER TABLE events ADD COLUMN ${c} TEXT`);
  for (const c of ["ad_start", "ad_end", "phone", "ask_for"]) if (ev.includes(c)) conn.exec(`ALTER TABLE events DROP COLUMN ${c}`);
  conn.exec("UPDATE events SET event_type = 'Paid Ads' WHERE event_type = 'Full Ads'");
  if (cols("dealerships").includes("disclaimer_url")) conn.exec("ALTER TABLE dealerships DROP COLUMN disclaimer_url");
  conn.exec("DROP TABLE IF EXISTS ad_copy_versions; DROP TABLE IF EXISTS images; DROP TABLE IF EXISTS ad_copy_log;");
}

function open() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const conn = new Database(path.join(DATA_DIR, "app.db"));
  conn.pragma("busy_timeout = 10000");
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");
  conn.exec(SCHEMA);
  migrate(conn);
  // IMMEDIATE so only one process seeds a fresh database.
  conn
    .transaction(() => {
      const { n } = conn.prepare("SELECT COUNT(*) AS n FROM clients").get() as { n: number };
      if (n === 0) seed(conn);
    })
    .immediate();
  return conn;
}

const g = globalThis as unknown as { __db?: Database.Database };
const conn = () => (g.__db ??= open());

/** Opened on first use (not at import) so builds and parallel workers don't fight over the file. */
export const db = new Proxy({} as Database.Database, {
  get(_t, prop) {
    const c = conn();
    const v = Reflect.get(c, prop, c);
    return typeof v === "function" ? v.bind(c) : v;
  },
});
