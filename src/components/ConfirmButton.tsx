"use client";

import { useTransition } from "react";

/** Button that runs a server action after an optional confirm(). */
export function ActionButton({
  action,
  confirm: question,
  className = "btn",
  children,
}: {
  action: () => Promise<unknown>;
  confirm?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        if (question && !window.confirm(question)) return;
        start(async () => {
          try {
            await action();
          } catch (err) {
            if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) alert(err.message);
          }
        });
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
