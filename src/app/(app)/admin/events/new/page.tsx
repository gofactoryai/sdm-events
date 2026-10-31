import Link from "next/link";
import { EventForm } from "@/components/EventForm";
import { listDealerOptions, nextEventNumber } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function NewAdminEvent({ searchParams }: { searchParams: Promise<{ dealership?: string }> }) {
  await requireRole("admin");
  const { dealership } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="h1">New event</h1>
        <Link href="/admin/dealerships/new?return=/admin/events/new" className="btn">+ New dealership</Link>
      </div>
      <EventForm dealers={listDealerOptions()} isAdmin defaultDealer={Number(dealership) || undefined} nextNumber={nextEventNumber()} />
    </div>
  );
}
