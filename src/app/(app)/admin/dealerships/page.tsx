import Link from "next/link";
import { listDealerships } from "@/lib/queries";
import { requireRole } from "@/lib/session";
import { SetupToggle } from "@/components/SetupToggle";

export default async function AdminDealerships({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  await requireRole("admin");
  const setupOnly = (await searchParams).setup === "1";
  const all = listDealerships();
  const rows = setupOnly ? all.filter((d) => !d.ghl_done || !d.closebot_done) : all;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="h1">{setupOnly ? "Setup queue" : "Dealerships"}</h1>
        <span className="text-sm text-gray-500">{rows.length}</span>
        <Link href="/admin/dealerships/new" className="btn btn-primary ml-auto">+ New dealership</Link>
      </div>
      {setupOnly && <p className="mb-3 text-sm text-gray-600">New dealerships that still need GoHighLevel and/or CloseBot setup. Events wait in &quot;Dealer Setup Needed&quot; until both are checked.</p>}
      <div className="card p-0">
        <table className="table">
          <thead><tr><th>Name</th><th>Brand</th><th>City</th><th>Phone</th><th>Website</th><th>Events</th><th>GHL</th><th>CloseBot</th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td><Link className="link font-semibold" href={`/admin/dealerships/${d.id}`}>{d.name}</Link></td>
                <td>{d.auto_brand}</td>
                <td>{[d.city, d.state].filter(Boolean).join(", ")}</td>
                <td className="whitespace-nowrap">{d.phone}</td>
                <td className="max-w-[220px] truncate">{d.website && <a className="link" href={d.website} target="_blank" rel="noreferrer">{d.website.replace(/^https?:\/\/(www\.)?/, "")}</a>}</td>
                <td>{d.event_count}</td>
                <td><SetupToggle id={d.id} field="ghl_done" done={!!d.ghl_done} label="" /></td>
                <td><SetupToggle id={d.id} field="closebot_done" done={!!d.closebot_done} label="" /></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="text-gray-500">Nothing waiting on setup. 🎉</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
