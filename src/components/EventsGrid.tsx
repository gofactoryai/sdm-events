"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type CellValueChangedEvent,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { updateEventField } from "@/app/actions";
import { CLOSED_STATUSES, EVENT_TYPES, HANDLED_BY, STATUS_COLORS, STATUSES } from "@/lib/constants";
import { fmtRange, money } from "@/lib/format";

ModuleRegistry.registerModules([AllCommunityModule]);

export type GridRow = {
  id: number;
  number: string;
  start_date: string | null;
  end_date: string | null;
  dealership_id: number;
  dealer_name: string;
  client_name: string;
  event_type: string;
  status: string;
  handled_by: string;
  budget: number | null;
  copy: string;
  ad_copy_url: string | null;
  images_url: string | null;
  retargeting_url: string | null;
  internal_notes: string | null;
};

const theme = themeQuartz.withParams({ fontSize: 13, rowHeight: 34, headerHeight: 36, spacing: 6 });
/** Shows a pasted Google link as "Open ↗"; double-click the cell to paste/edit the URL. */
const linkCell = (p: ICellRendererParams<GridRow>) =>
  p.value ? (
    <a href={p.value} target="_blank" rel="noreferrer" className="link" onClick={(e) => e.stopPropagation()}>
      Open ↗
    </a>
  ) : (
    <span className="text-gray-400">paste link</span>
  );
const shortDate = (v: string | null) => (v ? fmtRange(v, null) : "");

export function EventsGrid({ rows, showClient }: { rows: GridRow[]; showClient: boolean }) {
  const router = useRouter();
  const [view, setView] = useState<"active" | "past" | "all">("active");
  const [search, setSearch] = useState("");

  const visible = useMemo(
    () =>
      rows.filter((r) => {
        const closed = CLOSED_STATUSES.includes(r.status);
        return view === "all" || (view === "active" ? !closed : closed);
      }),
    [rows, view],
  );

  const columns = useMemo<ColDef<GridRow>[]>(
    () => [
      {
        headerName: "",
        width: 76,
        pinned: "left",
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<GridRow>) => (
          <div className="flex h-full items-center gap-1">
            <Link href={`/admin/events/${p.data!.id}`} className="btn btn-sm">
              Open
            </Link>
          </div>
        ),
      },
      { field: "number", headerName: "Number", width: 110, pinned: "left", editable: true },
      {
        headerName: "Event Dates",
        width: 130,
        valueGetter: (p) => fmtRange(p.data!.start_date, p.data!.end_date),
        comparator: (_a, _b, na, nb) => (na.data!.start_date ?? "").localeCompare(nb.data!.start_date ?? ""),
        sort: "asc",
      },
      {
        field: "dealer_name",
        headerName: "Dealership",
        width: 240,
        cellRenderer: (p: ICellRendererParams<GridRow>) => (
          <Link className="link" href={`/admin/dealerships/${p.data!.dealership_id}`}>
            {p.value}
          </Link>
        ),
      },
      ...(showClient ? [{ field: "client_name", headerName: "Client", width: 110 } as ColDef<GridRow>] : []),
      {
        field: "status",
        headerName: "Status",
        width: 200,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [...STATUSES] },
        cellStyle: { fontWeight: 600 },
      },
      { field: "event_type", headerName: "Type", width: 140, editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: EVENT_TYPES } },
      { field: "handled_by", headerName: "Chat Run By", width: 140, editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: HANDLED_BY } },
      { field: "copy", headerName: "Approval", width: 150 },
      { field: "ad_copy_url", headerName: "Ad Copy", width: 110, editable: true, cellRenderer: linkCell, tooltipField: "ad_copy_url" },
      { field: "images_url", headerName: "Images", width: 110, editable: true, cellRenderer: linkCell, tooltipField: "images_url" },
      { field: "retargeting_url", headerName: "Retargeting", width: 110, editable: true, cellRenderer: linkCell, tooltipField: "retargeting_url" },
      {
        field: "budget",
        headerName: "Budget",
        width: 100,
        editable: true,
        cellDataType: "number",
        valueFormatter: (p) => money(p.value),
      },
      { field: "start_date", headerName: "Start", width: 100, editable: true, cellDataType: "dateString", valueFormatter: (p) => shortDate(p.value) },
      { field: "end_date", headerName: "End", width: 100, editable: true, cellDataType: "dateString", valueFormatter: (p) => shortDate(p.value) },
      {
        field: "internal_notes",
        headerName: "Internal Notes",
        flex: 1,
        minWidth: 260,
        editable: true,
        cellEditor: "agLargeTextCellEditor",
        cellEditorPopup: true,
        tooltipField: "internal_notes",
      },
    ],
    [showClient],
  );

  async function onChange(e: CellValueChangedEvent<GridRow>) {
    const field = e.colDef.field as string;
    const res = await updateEventField(e.data.id, field, e.newValue ?? null);
    if (res?.error) {
      alert(res.error);
      e.node.setDataValue(field, e.oldValue);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-md border border-gray-300 bg-white text-sm">
          {(["active", "past", "all"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 capitalize ${view === v ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}>
              {v}
            </button>
          ))}
        </div>
        <input className="input w-64" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="text-xs text-gray-500">{visible.length} events · double-click a cell to edit</span>
        <Link href="/admin/events/new" className="btn btn-primary ml-auto">
          + New event
        </Link>
      </div>
      <div style={{ height: "calc(100vh - 170px)" }}>
        <AgGridReact<GridRow>
          theme={theme}
          rowData={visible}
          columnDefs={columns}
          getRowId={(p) => String(p.data.id)}
          quickFilterText={search}
          defaultColDef={{ sortable: true, filter: true, resizable: true }}
          getRowStyle={(p) => {
            const c = p.data ? STATUS_COLORS[p.data.status] : undefined;
            return c ? { background: c.bg, color: c.fg } : undefined;
          }}
          onCellValueChanged={onChange}
          stopEditingWhenCellsLoseFocus
          singleClickEdit={false}
          tooltipShowDelay={400}
        />
      </div>
    </div>
  );
}
