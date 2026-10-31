import fs from "node:fs";
import { db } from "@/lib/db";
import { contentType, resolveUpload } from "@/lib/files";
import { getEvent } from "@/lib/queries";
import { getSession } from "@/lib/session";

// Serves uploaded reports. Admin sees all; a client only their own events; BDC none.
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.join("/");
  const eventId = Number(rel.match(/^events\/(\d+)\//)?.[1]);
  const e = eventId ? getEvent(eventId) : undefined;
  const s = await getSession();
  const allowed = e && (s.role === "admin" || (s.role === "client" && e.client_id === s.clientId));
  const abs = resolveUpload(rel);
  if (!allowed || !abs || !fs.existsSync(abs)) return new Response("Not found", { status: 404 });

  const row = db.prepare("SELECT report_filename AS filename FROM events WHERE report_file = ?").get(rel) as
    | { filename: string }
    | undefined;
  const name = row?.filename ?? rel.split("/").pop()!;
  const download = new URL(req.url).searchParams.has("download");
  return new Response(fs.readFileSync(abs), {
    headers: {
      "Content-Type": contentType(name),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
    },
  });
}
