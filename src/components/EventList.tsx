import Link from "next/link";
import { fmtRange } from "@/lib/format";
import { copyState, type EventListRow } from "@/lib/queries";
import { StatusBadge } from "./StatusBadge";

export function EventList({ events, href, empty = "No events." }: { events: EventListRow[]; href: (e: EventListRow) => string; empty?: string }) {
  if (!events.length) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <table className="table">
      <thead><tr><th>Event</th><th>Dates</th><th>Dealership</th><th>Type</th><th>Status</th><th>Ad copy</th></tr></thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id} className="hover:bg-gray-50">
            <td><Link className="link font-semibold" href={href(e)}>{e.number}</Link></td>
            <td className="whitespace-nowrap">{fmtRange(e.start_date, e.end_date)}</td>
            <td>{e.dealer_name}</td>
            <td>{e.event_type}</td>
            <td><StatusBadge status={e.status} /></td>
            <td>{copyState(e)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
