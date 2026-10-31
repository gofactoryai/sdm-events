import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyApproval } from "@/components/CopyApproval";
import { EventForm } from "@/components/EventForm";
import { StatusBadge } from "@/components/StatusBadge";
import { chatLabel, CLIENT_EDITABLE_STATUSES } from "@/lib/constants";
import { fmtLong, fmtRange, lines } from "@/lib/format";
import { getDealership, getEvent, listDealerOptions } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function ClientEvent({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireRole("client");
  const e = getEvent(Number((await params).id));
  if (!e || e.client_id !== s.clientId) notFound();
  const editable = CLIENT_EDITABLE_STATUSES.includes(e.status);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/client" className="text-xs text-gray-500 hover:underline">← My events</Link>
      <div className="mb-5 mt-1 flex flex-wrap items-center gap-3">
        <h1 className="h1">{e.dealer_name}</h1>
        <StatusBadge status={e.status} />
        <span className="text-sm text-gray-600">{e.number} · {fmtRange(e.start_date, e.end_date)} · {e.event_type} · Chat: {chatLabel(e.handled_by, false)}</span>
      </div>

      {e.copy_status === "sent" && e.ad_copy_url && <div className="mb-6"><CopyApproval eventId={e.id} docUrl={e.ad_copy_url} /></div>}
      {e.copy_status && e.copy_status !== "sent" && (
        <section className="card mb-6 flex flex-wrap items-center gap-3">
          <h2 className="h2">Ad copy</h2>
          {e.copy_status === "approved"
            ? <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">✓ Approved</span>
            : <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">Our team is making your changes</span>}
          {e.ad_copy_url && <a className="btn ml-auto" href={e.ad_copy_url} target="_blank" rel="noreferrer">Open Google Doc ↗</a>}
        </section>
      )}

      {(e.report_file || e.report_notes) && (
        <section className="card mb-6">
          <h2 className="h2 mb-2">Event report</h2>
          {e.report_notes && <p className="mb-2 whitespace-pre-wrap text-sm">{e.report_notes}</p>}
          {e.report_file && <a className="btn" href={`/api/files/${e.report_file}?download`}>Download report</a>}
        </section>
      )}

      {editable ? (
        <section>
          <h2 className="h2 mb-3">Event details</h2>
          <EventForm e={e} dealers={listDealerOptions(s.clientId)} isAdmin={false} />
        </section>
      ) : (
        <section className="card mb-6 grid gap-4 text-sm md:grid-cols-2">
          <h2 className="h2 md:col-span-2">Event details</h2>
          <div><div className="label">Dates</div>{fmtLong(e.start_date)} – {fmtLong(e.end_date)}</div>
          <div><div className="label">Ask for on arrival</div>{getDealership(e.dealership_id)?.ask_for || "—"}</div>
          <div><div className="label">Incentives</div><ul className="list-disc pl-5">{lines(e.incentives).map((l) => <li key={l}>{l}</li>)}</ul></div>
          <div><div className="label">Notes</div><p className="whitespace-pre-wrap">{e.client_notes}</p></div>
          <p className="text-xs text-gray-500 md:col-span-2">This event is in progress, so details are locked. Contact the team for changes.</p>
        </section>
      )}
    </div>
  );
}
