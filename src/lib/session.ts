import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BDC_STATUSES, RETARGETING_STATUSES } from "./constants";
import { listClients, type EventListRow } from "./queries";

// No login system yet: the role lives in a cookie set by the role switcher in the header.
// When real logins are added, only this file needs to change.

export type Role = "admin" | "client" | "bdc" | "retargeting";
export type Session = { role: Role; clientId: number };

export async function getSession(): Promise<Session> {
  const c = await cookies();
  const r = c.get("role")?.value;
  const role: Role = r === "client" || r === "bdc" || r === "retargeting" ? r : "admin";
  const clientId = Number(c.get("client_id")?.value) || listClients()[0]?.id || 0;
  return { role, clientId };
}

export async function requireRole(...roles: Role[]): Promise<Session> {
  const s = await getSession();
  if (!roles.includes(s.role)) redirect("/");
  return s;
}

export function bdcCanSee(e: Pick<EventListRow, "status" | "handled_by">) {
  return BDC_STATUSES.includes(e.status) && e.handled_by !== "CloseBot";
}

export function retargetingCanSee(e: Pick<EventListRow, "status">) {
  return RETARGETING_STATUSES.includes(e.status);
}

export function canSeeEvent(s: Session, e: EventListRow) {
  if (s.role === "admin") return true;
  if (s.role === "client") return e.client_id === s.clientId;
  if (s.role === "bdc") return bdcCanSee(e);
  return false;
}
