import Link from "next/link";
import { notFound } from "next/navigation";
import { EventList } from "@/components/EventList";
import { DealershipForm } from "@/components/Forms";
import { getDealership, listEvents } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function ClientDealership({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireRole("client");
  const d = getDealership(Number((await params).id));
  if (!d || d.client_id !== s.clientId) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/client/dealerships" className="text-xs text-gray-500 hover:underline">← Dealerships</Link>
      <div className="mb-4 mt-1 flex items-center gap-3">
        <h1 className="h1">{d.name}</h1>
        <Link className="btn btn-primary ml-auto" href={`/client/events/new?dealership=${d.id}`}>+ New event</Link>
      </div>
      <div className="card mb-6"><h2 className="h2 mb-2">Events</h2><EventList events={listEvents({ dealershipId: d.id })} href={(e) => `/client/events/${e.id}`} /></div>
      <DealershipForm d={d} isAdmin={false} clients={[]} />
    </div>
  );
}
