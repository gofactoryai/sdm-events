import Link from "next/link";
import { listDealerships } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function ClientDealerships() {
  const s = await requireRole("client");
  const rows = listDealerships(s.clientId);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="h1">Dealerships</h1>
        <Link href="/client/dealerships/new" className="btn btn-primary ml-auto">+ New dealership</Link>
      </div>
      <div className="card p-0">
        <table className="table">
          <thead><tr><th>Name</th><th>Brand</th><th>City</th><th>Phone</th><th>Events</th><th>Setup</th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><Link className="link font-semibold" href={`/client/dealerships/${d.id}`}>{d.name}</Link></td>
                <td>{d.auto_brand}</td>
                <td>{[d.city, d.state].filter(Boolean).join(", ")}</td>
                <td>{d.phone}</td>
                <td>{d.event_count}</td>
                <td>{d.ghl_done && d.closebot_done ? <span className="text-green-700">Ready</span> : <span className="text-orange-700">Being set up</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
