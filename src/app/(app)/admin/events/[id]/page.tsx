import { notFound } from "next/navigation";
import { deleteEvent, saveReport } from "@/app/actions";
import { ActionButton } from "@/components/ConfirmButton";
import { AdminCopyPanel } from "@/components/AdminCopyPanel";
import { isOregon } from "@/lib/constants";
import { EventHeader } from "@/components/EventHeader";
import { EventForm } from "@/components/EventForm";
import { getDealership, getEvent, listDealerOptions } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function AdminEvent({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const e = getEvent(Number((await params).id));
  if (!e) notFound();
  const d = getDealership(e.dealership_id)!;
  const setupMissing = [!d.ghl_done && "GoHighLevel", !d.closebot_done && "CloseBot"].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl">
      <EventHeader e={e} active="details" />
      {setupMissing.length > 0 && (
        <div className="card mb-5 border-red-200 bg-red-50 text-sm text-red-900">
          Dealer setup not finished: {setupMissing.join(" and ")}. <a className="link" href={`/admin/dealerships/${d.id}`}>Open dealership →</a>
        </div>
      )}
      {e.event_type !== "Retargeting Only" ? (
        <AdminCopyPanel e={e} oregon={isOregon(d.state)} />
      ) : (
        e.retargeting_url && <div className="mb-6"><a className="btn" href={e.retargeting_url} target="_blank" rel="noreferrer">Retargeting sheet ↗</a></div>
      )}
      <EventForm e={e} dealers={listDealerOptions()} isAdmin />

      <form action={saveReport} className="card mt-6 flex flex-col gap-3">
        <input type="hidden" name="event_id" value={e.id} />
        <h2 className="h2">Post-event report</h2>
        <p className="text-xs text-gray-500">Upload the report built from the CRM and Meta Ads Manager. The client sees it in their event history.</p>
        {e.report_file && (
          <a className="link text-sm" href={`/api/files/${e.report_file}?download`}>📄 {e.report_filename}</a>
        )}
        <input type="file" name="file" className="text-sm" />
        <textarea name="report_notes" className="input" rows={3} defaultValue={e.report_notes ?? ""} placeholder="Summary for the client: leads, appointments, shows, sold, cost per lead…" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="mark_sent" /> Mark event as &quot;Report Sent&quot;</label>
        <div><button className="btn btn-primary">Save report</button></div>
      </form>

      <div className="mt-6 flex justify-end">
        <ActionButton className="btn btn-danger" confirm={`Delete ${e.number}? This also removes its approval history and report.`} action={deleteEvent.bind(null, e.id)}>
          Delete event
        </ActionButton>
      </div>
    </div>
  );
}
