import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { listDealerOptions } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function ClientNewEvent({ searchParams }: { searchParams: Promise<{ dealership?: string }> }) {
  const s = await requireRole("client");
  const { dealership } = await searchParams;
  const dealers = listDealerOptions(s.clientId);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="h1">New event</h1>
        <Link href="/client/dealerships/new?return=/client/events/new" className="btn">+ New dealership</Link>
      </div>
      <p className="mb-4 text-sm text-gray-600">Don&apos;t see the dealership? Add it first — it will be set up by our team.</p>
      <EventForm dealers={dealers} isAdmin={false} defaultDealer={Number(dealership) || undefined} />
    </div>
  );
}
