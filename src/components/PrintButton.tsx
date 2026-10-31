"use client";

import { useEffect } from "react";

/** "Download PDF" uses the browser's print dialog → Save as PDF. Print CSS hides the app chrome. */
export function PrintButton({ label = "Download PDF", auto = false }: { label?: string; auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [auto]);
  return (
    <button type="button" className="btn btn-primary print:hidden" onClick={() => window.print()}>
      {label}
    </button>
  );
}
