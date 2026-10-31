"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getSession, requireRole, type Session } from "@/lib/session";
import { CLIENT_EDITABLE_STATUSES, DAYS, STATUSES, stateTimezone } from "@/lib/constants";
import { extOf, removeUpload, saveUpload } from "@/lib/files";
import * as q from "@/lib/queries";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};
const num = (f: FormData, k: string) => {
  const v = str(f, k);
  if (v == null) return null;
  const n = Number(v.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const fileOf = (f: FormData, k: string) => {
  const v = f.get(k);
  return v instanceof File && v.size > 0 ? v : null;
};
const touch = (eventId: number) => db.prepare("UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(eventId);
const setStatus = (eventId: number, status: string) =>
  db.prepare("UPDATE events SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, eventId);
const refresh = () => revalidatePath("/", "layout");

function eventFor(s: Session, id: number) {
  const e = q.getEvent(id);
  if (!e || (s.role === "client" && e.client_id !== s.clientId) || s.role === "bdc") throw new Error("Event not found");
  return e;
}

// ---------- Role switcher ----------

export async function switchRole(value: string) {
  const c = await cookies();
  if (value.startsWith("client:")) {
    c.set("role", "client");
    c.set("client_id", value.slice("client:".length));
  } else {
    c.set("role", value === "bdc" || value === "retargeting" ? value : "admin");
  }
}

// ---------- Dealerships ----------

const DEALER_FIELDS = [
  "name", "auto_brand", "street", "city", "state", "zip", "phone", "website", "new_inventory_url", "used_inventory_url",
  "finance_url", "crm_lead_email", "xml_lead_email", "timezone", "ask_for", "contacts", "notes",
  ...DAYS.map((d) => `hours_${d.key}`),
];

export async function saveDealership(f: FormData) {
  const s = await requireRole("admin", "client");
  let id = Number(f.get("id")) || 0;
  const fields = s.role === "admin" ? [...DEALER_FIELDS, "setup_notes"] : DEALER_FIELDS;
  const values: Record<string, string | number | null> = Object.fromEntries(fields.map((k) => [k, str(f, k)]));
  if (!values.name) throw new Error("Dealership name is required");
  if (!values.timezone) values.timezone = stateTimezone(values.state as string | null);

  if (id) {
    const d = q.getDealership(id);
    if (!d || (s.role === "client" && d.client_id !== s.clientId)) throw new Error("Dealership not found");
    values.client_id = s.role === "admin" ? Number(f.get("client_id")) || d.client_id : d.client_id;
    db.prepare(`UPDATE dealerships SET ${[...fields, "client_id"].map((k) => `${k} = @${k}`).join(", ")} WHERE id = @id`).run({ ...values, id });
  } else {
    values.client_id = s.role === "admin" ? Number(f.get("client_id")) || s.clientId : s.clientId;
    const keys = [...fields, "client_id"];
    id = Number(
      db.prepare(`INSERT INTO dealerships (${keys.join(", ")}) VALUES (${keys.map((k) => "@" + k).join(", ")})`).run(values).lastInsertRowid,
    );
  }
  refresh();
  const returnTo = str(f, "return_to");
  if (returnTo) redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}dealership=${id}`);
  redirect(s.role === "admin" ? `/admin/dealerships/${id}` : "/client/dealerships");
}

export async function setDealerSetup(id: number, field: "ghl_done" | "closebot_done", done: boolean) {
  await requireRole("admin");
  if (field !== "ghl_done" && field !== "closebot_done") throw new Error("Bad field");
  db.prepare(`UPDATE dealerships SET ${field} = ? WHERE id = ?`).run(done ? 1 : 0, id);
  // Once both are done, events waiting on setup move on to ad copy.
  const d = q.getDealership(id);
  if (d?.ghl_done && d.closebot_done) {
    db.prepare(
      "UPDATE events SET status = 'Ad Copy Needed', updated_at = CURRENT_TIMESTAMP WHERE dealership_id = ? AND status = 'Dealer Setup Needed'",
    ).run(id);
  }
  refresh();
}

// ---------- Events ----------

const CLIENT_EVENT_FIELDS = ["start_date", "end_date", "holiday_hours", "incentives", "client_notes"];
const ADMIN_EVENT_FIELDS = [...CLIENT_EVENT_FIELDS, "event_type", "status", "handled_by", "internal_notes", "meta_notes", "ad_copy_url", "images_url", "retargeting_url"];

export async function saveEvent(f: FormData) {
  const s = await requireRole("admin", "client");
  let id = Number(f.get("id")) || 0;
  const dealershipId = Number(f.get("dealership_id"));
  const dealer = q.getDealership(dealershipId);
  if (!dealer || (s.role === "client" && dealer.client_id !== s.clientId)) throw new Error("Choose a dealership");

  const fields = s.role === "admin" ? ADMIN_EVENT_FIELDS : CLIENT_EVENT_FIELDS;
  const values: Record<string, string | number | null> = Object.fromEntries(fields.map((k) => [k, str(f, k)]));
  values.dealership_id = dealershipId;
  // Clients can't set the type (only admin can choose "Retargeting Only"); new client events are Paid Ads.
  if (s.role === "admin") values.event_type ??= "Paid Ads";
  else if (!id) values.event_type = "Paid Ads";
  if (s.role === "admin") {
    values.budget = num(f, "budget");
    values.number = str(f, "number");
    if (values.handled_by == null) values.handled_by = "BDC";
  }

  if (id) {
    const e = eventFor(s, id);
    if (s.role === "client" && !CLIENT_EDITABLE_STATUSES.includes(e.status)) throw new Error("This event can no longer be edited. Contact your account team.");
    if (s.role === "admin" && !values.number) values.number = e.number;
    if (s.role === "admin" && !values.status) values.status = e.status;
    const keys = Object.keys(values);
    db.prepare(`UPDATE events SET ${keys.map((k) => `${k} = @${k}`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ ...values, id });
  } else {
    values.number ??= q.nextEventNumber();
    const setupDone = dealer.ghl_done && dealer.closebot_done;
    if (!setupDone) values.status = "Dealer Setup Needed";
    else values.status ??= "New Order";
    const keys = Object.keys(values);
    id = Number(db.prepare(`INSERT INTO events (${keys.join(", ")}) VALUES (${keys.map((k) => "@" + k).join(", ")})`).run(values).lastInsertRowid);
  }
  refresh();
  redirect(s.role === "admin" ? `/admin/events/${id}` : `/client/events/${id}`);
}

const GRID_FIELDS = ["number", "status", "handled_by", "event_type", "budget", "start_date", "end_date", "internal_notes", "ad_copy_url", "images_url", "retargeting_url"];

/** Inline edits from the admin spreadsheet grid. */
export async function updateEventField(id: number, field: string, value: string | number | null) {
  await requireRole("admin");
  if (!GRID_FIELDS.includes(field)) return { error: "That column can't be edited here." };
  if (field === "status" && !STATUSES.includes(value as (typeof STATUSES)[number])) return { error: "Unknown status" };
  if (field === "number" && !value) return { error: "Event number is required" };
  try {
    db.prepare(`UPDATE events SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(value === "" ? null : value, id);
  } catch (err) {
    return { error: String(err).includes("UNIQUE") ? "That event number is already used." : "Could not save." };
  }
  refresh();
  return { ok: true };
}

export async function deleteEvent(id: number) {
  const s = await requireRole("admin");
  const e = eventFor(s, id);
  removeUpload(e.report_file);
  db.prepare("DELETE FROM events WHERE id = ?").run(id);
  refresh();
  redirect("/admin/events");
}

// ---------- Ad copy approval ----------
// The ad copy itself lives in a Google Doc (events.ad_copy_url); the app only tracks its approval status.

export async function sendCopyToClient(eventId: number) {
  const s = await requireRole("admin");
  const e = eventFor(s, eventId);
  if (!e.ad_copy_url) throw new Error("Add the Google Doc link for the ad copy first.");
  db.prepare("UPDATE events SET copy_status = 'sent', share_token = COALESCE(share_token, ?) WHERE id = ?").run(nanoid(16), eventId);
  setStatus(eventId, "Awaiting Client Approval");
  refresh();
}

/** For approvals that came in by email/phone. */
export async function markCopyApproved(eventId: number) {
  const s = await requireRole("admin");
  eventFor(s, eventId);
  db.prepare("UPDATE events SET copy_status = 'approved' WHERE id = ?").run(eventId);
  setStatus(eventId, "Approved");
  refresh();
}

/** Client approves or asks for changes, from their portal or the share link. */
export async function respondToCopy(input: { eventId: number; token?: string; decision: "approve" | "changes" }) {
  const e = q.getEvent(input.eventId);
  if (!e) throw new Error("Event not found");
  if (input.token) {
    if (input.token !== e.share_token) throw new Error("This link is no longer valid");
  } else {
    const s = await getSession();
    if (s.role !== "client" || e.client_id !== s.clientId) throw new Error("Not allowed");
  }
  if (e.copy_status !== "sent") throw new Error("This ad copy isn't waiting for approval.");
  const approve = input.decision === "approve";
  db.prepare("UPDATE events SET copy_status = ? WHERE id = ?").run(approve ? "approved" : "changes", e.id);
  setStatus(e.id, approve ? "Approved" : "Revisions Requested");
  refresh();
}

// ---------- Reports ----------

export async function saveReport(f: FormData) {
  const s = await requireRole("admin");
  const eventId = Number(f.get("event_id"));
  const e = eventFor(s, eventId);
  const file = fileOf(f, "file");
  if (file) {
    removeUpload(e.report_file);
    const stored = await saveUpload(eventId, file);
    db.prepare("UPDATE events SET report_file = ?, report_filename = ? WHERE id = ?").run(stored, `${e.number}_Report${extOf(file.name)}`, eventId);
  }
  db.prepare("UPDATE events SET report_notes = ? WHERE id = ?").run(str(f, "report_notes"), eventId);
  if (f.get("mark_sent") === "on") setStatus(eventId, "Report Sent");
  touch(eventId);
  refresh();
}
