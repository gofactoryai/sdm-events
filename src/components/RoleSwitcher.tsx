"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { switchRole } from "@/app/actions";

export function RoleSwitcher({ value, clients }: { value: string; clients: { id: number; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-xs text-gray-500 print:hidden">
      Viewing as
      <select
        className="input w-auto py-1"
        value={value}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await switchRole(e.target.value);
            router.push("/");
            router.refresh();
          })
        }
      >
        <option value="admin">Admin team</option>
        {clients.map((c) => (
          <option key={c.id} value={`client:${c.id}`}>
            Client: {c.name}
          </option>
        ))}
        <option value="bdc">BDC team</option>
        <option value="retargeting">Retargeting team</option>
      </select>
    </label>
  );
}
