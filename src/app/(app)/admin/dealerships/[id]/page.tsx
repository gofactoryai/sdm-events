import Link from "next/link";
import { notFound } from "next/navigation";
import { EventList } from "@/components/EventList";
import { DealershipForm } from "@/components/Forms";
import { SetupToggle } from "@/components/SetupToggle";
import { getDealership, listClients, listEvents } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function AdminDealership({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const d = getDealership(Number((await params).id));
  if (!d) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/dealerships" className="text-xs text-gray-500 hover:underline">← Dealerships</Link>
      <div className="mb-4 mt-1 flex items-center gap-3">
        <h1 className="h1">{d.name}</h1>
        <Link className="btn btn-primary ml-auto" href={`/admin/events/new?dealership=${d.id}`}>+ New event</Link>
      </div>
      <div className={`card mb-6 ${d.ghl_done && d.closebot_done ? "" : "border-red-200 bg-red-50"}`}>
        <h2 className="h2 mb-2">Setup checklist</h2>
        <div className="flex flex-col gap-2">
          <SetupToggle id={d.id} field="ghl_done" done={!!d.ghl_done} label="GoHighLevel sub-account created and lead routing set up" />
          <SetupToggle id={d.id} field="closebot_done" done={!!d.closebot_done} label="CloseBot bot configured for this dealership" />
        </div>
      </div>
      <div className="card mb-6">
        <h2 className="h2 mb-2">Events</h2>
        <EventList events={listEvents({ dealershipId: d.id })} href={(e) => `/admin/events/${e.id}`} />
      </div>
      <DealershipForm d={d} isAdmin clients={listClients()} />
    </div>
  );
}
