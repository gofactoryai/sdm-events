import { EventsGrid, type GridRow } from "@/components/EventsGrid";
import { copyState, listClients, listEvents } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function AdminEvents() {
  await requireRole("admin");
  const rows: GridRow[] = listEvents().map((e) => ({
    id: e.id,
    number: e.number,
    start_date: e.start_date,
    end_date: e.end_date,
    dealership_id: e.dealership_id,
    dealer_name: e.dealer_name,
    client_name: e.client_name,
    event_type: e.event_type,
    status: e.status,
    handled_by: e.handled_by,
    budget: e.budget,
    copy: copyState(e),
    ad_copy_url: e.ad_copy_url,
    images_url: e.images_url,
    retargeting_url: e.retargeting_url,
    internal_notes: e.internal_notes,
  }));
  return <EventsGrid rows={rows} showClient={listClients().length > 1} />;
}
