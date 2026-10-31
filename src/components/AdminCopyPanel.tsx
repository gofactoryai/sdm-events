import { headers } from "next/headers";
import { markCopyApproved, sendCopyToClient } from "@/app/actions";
import type { EventListRow } from "@/lib/queries";
import { ActionButton } from "./ConfirmButton";
import { OregonNotice } from "./OregonNotice";

const BADGE: Record<string, string> = {
  sent: "bg-orange-100 text-orange-800",
  changes: "bg-orange-200 text-orange-900",
  approved: "bg-green-100 text-green-800",
};
const TEXT: Record<string, string> = { sent: "Waiting on client", changes: "Client requested changes", approved: "✓ Approved" };

export async function AdminCopyPanel({ e, oregon }: { e: EventListRow; oregon: boolean }) {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  return (
    <section className="card mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="h2">Ad copy &amp; images</h2>
        {e.copy_status && <span className={`rounded px-2 py-0.5 text-xs font-semibold ${BADGE[e.copy_status]}`}>{TEXT[e.copy_status]}</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {e.ad_copy_url ? <a className="btn" href={e.ad_copy_url} target="_blank" rel="noreferrer">Ad copy doc ↗</a> : <span className="text-sm text-gray-500">No ad copy link yet — add it below.</span>}
          {e.images_url && <a className="btn" href={e.images_url} target="_blank" rel="noreferrer">Images folder ↗</a>}
          {e.retargeting_url && <a className="btn" href={e.retargeting_url} target="_blank" rel="noreferrer">Retargeting sheet ↗</a>}
        </div>
      </div>
      {oregon && <OregonNotice />}
      {e.ad_copy_url && (
        <div className="flex flex-wrap gap-2">
          <ActionButton className="btn btn-primary" action={sendCopyToClient.bind(null, e.id)}
            confirm={e.copy_status ? "Send the ad copy to the client again for approval?" : "Send the ad copy to the client for approval?"}>
            {e.copy_status ? "Re-send for approval" : "Send to client for approval"}
          </ActionButton>
          {e.copy_status !== "approved" && (
            <ActionButton className="btn" action={markCopyApproved.bind(null, e.id)} confirm="Mark the ad copy approved (e.g. client approved by email)?">
              Mark approved
            </ActionButton>
          )}
        </div>
      )}
      {e.share_token && (
        <div>
          <div className="label">Client approval link (no login needed)</div>
          <input readOnly className="input font-mono text-xs" value={`${origin}/share/${e.share_token}`} />
        </div>
      )}
    </section>
  );
}
