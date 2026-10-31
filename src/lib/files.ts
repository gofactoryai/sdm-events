import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { UPLOAD_DIR } from "./db";

/** Saves an uploaded file under data/uploads/events/<eventId>/ and returns its relative path. */
export async function saveUpload(eventId: number, file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".bin";
  const rel = path.join("events", String(eventId), `${nanoid(10)}${ext}`);
  const abs = path.join(UPLOAD_DIR, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.from(await file.arrayBuffer()));
  return rel;
}

export function removeUpload(rel: string | null | undefined) {
  if (!rel) return;
  const abs = resolveUpload(rel);
  if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
}

/** Absolute path for a stored file, or null if it escapes the upload folder. */
export function resolveUpload(rel: string): string | null {
  const abs = path.resolve(UPLOAD_DIR, rel);
  return abs.startsWith(UPLOAD_DIR + path.sep) ? abs : null;
}

export const extOf = (name: string) => path.extname(name).toLowerCase();

export function contentType(name: string): string {
  const map: Record<string, string> = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
    ".mp4": "video/mp4", ".mov": "video/quicktime", ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".csv": "text/csv",
  };
  return map[extOf(name)] ?? "application/octet-stream";
}
