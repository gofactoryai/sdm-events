import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { fmtRange } from "@/lib/format";
import { listEvents } from "@/lib/queries";
import { bdcCanSee, requireRole } from "@/lib/session";

export default async function BdcHome() {
  await requireRole("bdc", "admin");
  const events = listEvents().filter(bdcCanSee);
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="h1 mb-1">Upcoming &amp; running events</h1>
      <p className="mb-4 text-sm text-gray-600">Open an event for its summary. Use &quot;Download PDF&quot; to save or print it.</p>
      <div className="grid gap-3">
        {events.map((e) => (
          <Link key={e.id} href={`/bdc/events/${e.id}`} className="card flex items-center gap-4 hover:border-blue-300">
            <div className="flex-1">
              <div className="font-semibold">{e.dealer_name}</div>
              <div className="text-sm text-gray-600">{fmtRange(e.start_date, e.end_date)} · {e.number}</div>
            </div>
            <StatusBadge status={e.status} />
          </Link>
        ))}
        {!events.length && <p className="text-sm text-gray-500">No upcoming events.</p>}
      </div>
    </div>
  );
}
