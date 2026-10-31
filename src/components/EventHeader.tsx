import Link from "next/link";
import { fmtRange } from "@/lib/format";
import type { EventListRow } from "@/lib/queries";
import { StatusBadge } from "./StatusBadge";

const TABS = [
  { key: "details", label: "Details", href: (id: number) => `/admin/events/${id}` },
  { key: "bdc", label: "BDC Summary", href: (id: number) => `/bdc/events/${id}` },
];

export function EventHeader({ e, active }: { e: EventListRow; active: string }) {
  return (
    <div className="mb-5 print:hidden">
      <Link href="/admin/events" className="text-xs text-gray-500 hover:underline">← All events</Link>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="h1">{e.dealer_name}</h1>
        <StatusBadge status={e.status} />
      </div>
      <p className="text-sm text-gray-600">
        {e.number} · {fmtRange(e.start_date, e.end_date)} · {e.event_type} · Chat: {e.handled_by}
      </p>
      <nav className="mt-3 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <Link key={t.key} href={t.href(e.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${active === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
