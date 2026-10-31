"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Dealer = { id: number; name: string };

/** Type-to-search dealership field (also opens as a full list). Submits the chosen id as `dealership_id`. */
export function DealerPicker<D extends Dealer>({ dealers, defaultId, onChange }: { dealers: D[]; defaultId?: number; onChange?: (d?: D) => void }) {
  const initial = dealers.find((d) => d.id === defaultId);
  const [selected, setSelected] = useState<D | undefined>(initial);
  const [text, setText] = useState(initial?.name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    // Show the full list when the box is empty or still shows the chosen dealer
    if (!q || selected?.name === text) return dealers;
    const words = q.split(/\s+/);
    return dealers.filter((d) => words.every((w) => d.name.toLowerCase().includes(w)));
  }, [dealers, text, selected]);

  // Block form submit until a real dealership is picked
  useEffect(() => {
    input.current?.setCustomValidity(selected && selected.name === text ? "" : "Choose a dealership from the list");
  }, [selected, text]);

  useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (d: D) => {
    setSelected(d);
    setText(d.name);
    setOpen(false);
    onChange?.(d);
  };

  return (
    <div className="relative">
      <input type="hidden" name="dealership_id" value={selected && selected.name === text ? selected.id : ""} />
      <div className="relative">
        <input
          ref={input}
          id="dealership_id"
          className="input pr-8"
          placeholder="Start typing a dealership…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="dealer-options"
          value={text}
          required
          onChange={(e) => {
            setText(e.target.value);
            if (selected && e.target.value !== selected.name) onChange?.(undefined);
            setOpen(true);
            setActive(0);
          }}
          onFocus={(e) => {
            e.target.select();
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && matches[active]) {
              e.preventDefault();
              choose(matches[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Show all dealerships"
          className="absolute inset-y-0 right-0 px-2.5 text-gray-400 hover:text-gray-700"
          onMouseDown={(e) => {
            e.preventDefault();
            input.current?.focus();
            setOpen((o) => !o);
          }}
        >
          ▾
        </button>
      </div>
      {open && (
        <ul ref={list} id="dealer-options" role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
          {matches.map((d, i) => (
            <li
              key={d.id}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer px-3 py-1.5 ${i === active ? "bg-blue-50 text-blue-800" : ""} ${selected?.id === d.id ? "font-semibold" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(d);
              }}
            >
              {d.name}
            </li>
          ))}
          {!matches.length && <li className="px-3 py-1.5 text-gray-500">No dealership matches &quot;{text}&quot;. Use &quot;+ New dealership&quot; to add it.</li>}
        </ul>
      )}
    </div>
  );
}
