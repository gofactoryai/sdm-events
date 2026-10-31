import Link from "next/link";
import { notFound } from "next/navigation";
import { EventHeader } from "@/components/EventHeader";
import { EventSummary } from "@/components/EventSummary";
import { PrintButton } from "@/components/PrintButton";
import { getDealership, getEvent } from "@/lib/queries";
import { canSeeEvent, getSession } from "@/lib/session";

export default async function BdcEvent({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  const e = getEvent(Number((await params).id));
  if (!e || s.role === "client" || !canSeeEvent(s, e)) notFound();
  const d = getDealership(e.dealership_id)!;
  return (
    <div className="mx-auto max-w-5xl">
      {s.role === "admin" ? <EventHeader e={e} active="bdc" /> : <Link href="/bdc" className="text-xs text-gray-500 hover:underline print:hidden">← Events</Link>}
      <div className="mb-3 flex justify-end print:hidden"><PrintButton /></div>
      <div className="card print:border-0 print:shadow-none"><EventSummary e={e} d={d} /></div>
    </div>
  );
}
