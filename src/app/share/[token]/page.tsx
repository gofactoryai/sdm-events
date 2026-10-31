import { notFound } from "next/navigation";
import { CopyApproval } from "@/components/CopyApproval";
import { fmtCampaignRange } from "@/lib/format";
import { getClient, getEventByToken } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Login-free approval page for the client or dealership. */
export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const e = getEventByToken(token);
  if (!e) notFound();
  const client = getClient(e.client_id);
  const color = client?.brand_color ?? "#1d4ed8";

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 font-bold">
          <span className="inline-block h-6 w-6 rounded" style={{ background: color }} />
          {client?.brand_name ?? client?.name}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="h1">{e.dealer_name}</h1>
        <p className="mb-5 text-gray-600">Campaign: Facebook Event ({fmtCampaignRange(e.start_date, e.end_date)})</p>
        {e.copy_status === "sent" && e.ad_copy_url ? (
          <CopyApproval eventId={e.id} docUrl={e.ad_copy_url} token={token} />
        ) : (
          <div className="card flex flex-wrap items-center gap-3 text-sm">
            <p className="font-semibold">
              {e.copy_status === "approved" ? "✓ This ad copy has been approved. Thank you!"
                : e.copy_status === "changes" ? "Thanks — your changes were received. We'll send an updated version soon."
                : "There's no ad copy to review yet."}
            </p>
            {e.ad_copy_url && e.copy_status && <a className="btn ml-auto" href={e.ad_copy_url} target="_blank" rel="noreferrer">Open Google Doc ↗</a>}
          </div>
        )}
      </main>
    </div>
  );
}
