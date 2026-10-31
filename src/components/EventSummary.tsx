import { fmtLong, hoursSummary, lines, tzAbbr } from "@/lib/format";
import type { Dealership, EventRow } from "@/lib/queries";

/** One-page event summary for the BDC team (mirrors the current "BDC EVENT" PDF). */
export function EventSummary({ e, d }: { e: EventRow; d: Dealership }) {
  const abbr = tzAbbr(d.timezone, e.start_date);
  const address = [d.street, [d.city, [d.state, d.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter(Boolean).join(", ");
  const hours = hoursSummary(d, abbr);
  const incentives = lines(e.incentives);

  const rows: [string, React.ReactNode][] = [
    ["Dealership Name", d.name],
    ["Auto Brand", d.auto_brand],
    ["Phone", d.phone],
    ["Address", address],
    ["Timezone", abbr],
    [
      "Hours",
      hours.length || e.holiday_hours ? (
        <>
          {hours.map((h) => (
            <div key={h}>{h}</div>
          ))}
          {e.holiday_hours && <div className="mt-1 font-semibold">Holiday: {e.holiday_hours}</div>}
        </>
      ) : null,
    ],
    ["Ask for on Arrival", d.ask_for],
    ["Used Inventory", d.used_inventory_url && <Url href={d.used_inventory_url} />],
    ["New Inventory", d.new_inventory_url && <Url href={d.new_inventory_url} />],
    ["Event Start Date", fmtLong(e.start_date)],
    ["Event End Date", fmtLong(e.end_date)],
    [
      "Event Incentives",
      incentives.length ? (
        <ul className="list-disc pl-5">
          {incentives.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : null,
    ],
  ];

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <h2 className="text-sm font-bold uppercase tracking-wide">Event Details</h2>
      <hr className="mb-6 mt-3 border-gray-400" />
      <table className="w-full border-collapse border border-black text-[15px]">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="break-inside-avoid">
              <th className="w-[40%] border border-black px-2 py-2 text-left align-top text-lg font-bold">{label}</th>
              <td className="border border-black px-2 py-2 align-top">{value || <span className="text-gray-400 print:hidden">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Url({ href }: { href: string }) {
  const full = /^https?:\/\//.test(href) ? href : `https://${href}`;
  return (
    <a href={full} target="_blank" rel="noreferrer" className="break-all text-blue-700 print:text-black">
      {href}
    </a>
  );
}
