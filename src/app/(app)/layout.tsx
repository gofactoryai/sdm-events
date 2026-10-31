import Link from "next/link";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { getClient, listClients } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const NAV = {
  admin: [
    { href: "/admin/events", label: "Events" },
    { href: "/admin/dealerships", label: "Dealerships" },
    { href: "/admin/dealerships?setup=1", label: "Setup queue" },
    { href: "/bdc", label: "BDC view" },
    { href: "/retargeting", label: "Retargeting view" },
  ],
  client: [
    { href: "/client", label: "My events" },
    { href: "/client/events/new", label: "New event" },
    { href: "/client/dealerships", label: "Dealerships" },
  ],
  bdc: [{ href: "/bdc", label: "Events" }],
  retargeting: [{ href: "/retargeting", label: "Events" }],
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  const clients = listClients();
  const client = s.role === "client" ? getClient(s.clientId) : undefined;
  const brand = s.role === "admin" ? "Events Admin" : s.role === "bdc" ? "BDC Event Board" : s.role === "retargeting" ? "Retargeting Board" : (client?.brand_name ?? client?.name ?? "Events");
  const color = s.role === "client" ? (client?.brand_color ?? "#1d4ed8") : s.role === "bdc" ? "#047857" : s.role === "retargeting" ? "#7c3aed" : "#111827";
  const switchValue = s.role === "client" ? `client:${s.clientId}` : s.role;

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-[1800px] items-center gap-6 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="inline-block h-6 w-6 rounded" style={{ background: color }} />
            {brand}
          </Link>
          <nav className="flex gap-1 text-sm">
            {NAV[s.role].map((n) => (
              <Link key={n.href} href={n.href} className="rounded px-2.5 py-1.5 text-gray-700 hover:bg-gray-100">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <RoleSwitcher value={switchValue} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1800px] px-4 py-5 print:p-0">{children}</main>
    </div>
  );
}
