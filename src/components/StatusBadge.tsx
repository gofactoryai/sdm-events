import { STATUS_COLORS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "#f3f4f6", fg: "#374151" };
  return (
    <span className="inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: c.bg, color: c.fg, border: "1px solid rgba(0,0,0,.08)" }}>
      {status}
    </span>
  );
}
