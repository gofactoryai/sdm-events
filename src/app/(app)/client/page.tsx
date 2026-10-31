import Link from "next/link";
import { EventList } from "@/components/EventList";
import { CLOSED_STATUSES } from "@/lib/constants";
import { listEvents } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function ClientHome() {
  const s = await requireRole("client");
  const events = listEvents({ clientId: s.clientId });
  const waiting = events.filter((e) => e.status === "Awaiting Client Approval");
  const current = events.filter((e) => !CLOSED_STATUSES.includes(e.status));
  const past = events.filter((e) => CLOSED_STATUSES.includes(e.status)).reverse();
  const href = (e: { id: number }) => `/client/events/${e.id}`;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center gap-3">
        <h1 className="h1">My events</h1>
        <Link href="/client/events/new" className="btn btn-primary ml-auto">+ New event</Link>
      </div>
      {waiting.length > 0 && (
        <div className="card mb-5 border-orange-200 bg-orange-50">
          <h2 className="h2 mb-2">Ad copy waiting for your approval</h2>
          <ul className="text-sm">
            {waiting.map((e) => <li key={e.id}><Link className="link font-semibold" href={href(e)}>{e.dealer_name} · {e.number}</Link></li>)}
          </ul>
        </div>
      )}
      <div className="card mb-5"><h2 className="h2 mb-2">Current &amp; upcoming</h2><EventList events={current} href={href} /></div>
      <div className="card"><h2 className="h2 mb-2">Past events</h2><EventList events={past} href={href} empty="No past events yet." /></div>
    </div>
  );
}
