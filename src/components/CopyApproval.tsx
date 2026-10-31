"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToCopy } from "@/app/actions";

/** Approve / request changes on the Google Doc ad copy (client portal and share link). */
export function CopyApproval({ eventId, docUrl, token }: { eventId: number; docUrl: string; token?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const submit = (decision: "approve" | "changes") =>
    start(async () => {
      try {
        await respondToCopy({ eventId, token, decision });
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });

  return (
    <div className="card flex flex-col gap-3 border-orange-200 bg-orange-50">
      <div>
        <h2 className="h2">Ad copy is ready for your review</h2>
        <p className="text-sm text-gray-700">Open the Google Doc and review the ads. Leave any changes as comments or edits in the doc, then approve or request changes here.</p>
      </div>
      <div><a className="btn btn-primary" href={docUrl} target="_blank" rel="noreferrer">Open ad copy (Google Doc) ↗</a></div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" disabled={pending} onClick={() => submit("changes")}>Request changes</button>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => submit("approve")}>Approve ad copy</button>
      </div>
    </div>
  );
}
