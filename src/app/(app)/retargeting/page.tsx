import { StatusBadge } from "@/components/StatusBadge";
import { fmtRange } from "@/lib/format";
import { listEvents } from "@/lib/queries";
import { requireRole, retargetingCanSee } from "@/lib/session";

export default async function RetargetingHome() {
  await requireRole("retargeting", "admin");
  const events = listEvents().filter(retargetingCanSee);
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="h1 mb-1">Active events</h1>
      <p className="mb-4 text-sm text-gray-600">Open an event&apos;s retargeting sheet to update it.</p>
      <div className="grid gap-3">
        {events.map((e) => (
          <div key={e.id} className="card flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold">{e.dealer_name}</div>
              <div className="text-sm text-gray-600">{fmtRange(e.start_date, e.end_date)} · {e.number} · {e.event_type}</div>
            </div>
            <StatusBadge status={e.status} />
            {e.retargeting_url ? (
              <a className="btn btn-primary" href={e.retargeting_url} target="_blank" rel="noreferrer">Open retargeting sheet ↗</a>
            ) : (
              <span className="text-sm text-gray-400">No sheet linked yet</span>
            )}
          </div>
        ))}
        {!events.length && <p className="text-sm text-gray-500">No active events.</p>}
      </div>
    </div>
  );
}
