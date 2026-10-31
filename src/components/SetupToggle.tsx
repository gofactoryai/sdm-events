"use client";

import { useTransition } from "react";
import { setDealerSetup } from "@/app/actions";

export function SetupToggle({ id, field, done, label }: { id: number; field: "ghl_done" | "closebot_done"; done: boolean; label: string }) {
  const [pending, start] = useTransition();
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-sm ${pending ? "opacity-50" : ""}`}>
      <input type="checkbox" className="h-4 w-4" checked={done} disabled={pending} onChange={(e) => start(() => setDealerSetup(id, field, e.target.checked))} />
      {label}
    </label>
  );
}
