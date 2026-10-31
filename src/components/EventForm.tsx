"use client";

import { useState } from "react";
import { saveEvent } from "@/app/actions";
import { CLIENT_EVENT_TYPES, EVENT_TYPES, HANDLED_BY, POPULAR_INCENTIVES, STATUSES } from "@/lib/constants";
import type { DealerOption, EventRow } from "@/lib/queries";
import { DealerPicker } from "./DealerPicker";
import { OregonNotice } from "./OregonNotice";
import { Area, Field, Select, opts } from "./FormFields";

export function EventForm({ e, dealers, isAdmin, defaultDealer, nextNumber }: {
  e?: EventRow; dealers: DealerOption[]; isAdmin: boolean; defaultDealer?: number; nextNumber?: string;
}) {
  const initial = dealers.find((d) => d.id === (e?.dealership_id ?? defaultDealer));
  const [dealer, setDealer] = useState(initial);
  const [incentives, setIncentives] = useState(e?.incentives ?? "");

  const addPopular = () => {
    const have = incentives.split("\n").map((l) => l.trim()).filter(Boolean);
    const lower = new Set(have.map((l) => l.toLowerCase()));
    setIncentives([...have, ...POPULAR_INCENTIVES.filter((p) => !lower.has(p.toLowerCase()))].join("\n"));
  };

  return (
    <form action={saveEvent} className="flex flex-col gap-6">
      {e && <input type="hidden" name="id" value={e.id} />}
      <section className="card grid grid-cols-1 gap-4 md:grid-cols-4">
        <h2 className="h2 md:col-span-4">Event</h2>
        <div className="md:col-span-2">
          <label className="label" htmlFor="dealership_id">Dealership *</label>
          <DealerPicker dealers={dealers} defaultId={initial?.id} onChange={setDealer} />
        </div>
        {isAdmin && <Field label="Event number" name="number" value={e?.number} placeholder={nextNumber ?? "Auto"} />}
        {isAdmin ? (
          <Select label="Event type" name="event_type" value={e?.event_type} options={opts(EVENT_TYPES)} />
        ) : (
          <div>
            <label className="label">Event type</label>
            <div className="input bg-gray-50 text-gray-700">{e?.event_type ?? CLIENT_EVENT_TYPES[0]}</div>
          </div>
        )}

        {dealer && <DealerInfo d={dealer} editHref={`${isAdmin ? "/admin" : "/client"}/dealerships/${dealer.id}`} />}

        <Field label="Event start" name="start_date" type="date" value={e?.start_date} required className="md:col-start-1" />
        <Field label="Event end" name="end_date" type="date" value={e?.end_date} required />
      </section>

      <section className="card grid grid-cols-1 gap-4 md:grid-cols-2">
        <h2 className="h2 md:col-span-2">Ad copy details</h2>
        {dealer?.oregon && <OregonNotice className="md:col-span-2" />}
        <div>
          <div className="mb-1 flex items-end justify-between gap-2">
            <label className="label mb-0" htmlFor="incentives">Event incentives (one per line)</label>
            <button type="button" className="btn btn-sm" onClick={addPopular}>+ Add most popular incentives</button>
          </div>
          <textarea id="incentives" name="incentives" rows={7} className="input" value={incentives} onChange={(ev) => setIncentives(ev.target.value)}
            placeholder={"As little as $0 down\nRates as low as 0% APR\nUp to $4,000 over KBB for your trade"} />
          <p className="mt-1 text-xs text-gray-500">Add the popular ones, then edit or delete lines to match this event.</p>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Holiday hours" name="holiday_hours" value={e?.holiday_hours} placeholder="Closed Thanksgiving Day" />
        </div>
        <div className="md:col-span-2">
          <Area label="Ad copy notes / special offers" name="client_notes" value={e?.client_notes} rows={3}
            placeholder="$2,000 cash giveaway each Saturday at 4pm. Must take test drive to enter." />
        </div>
      </section>

      {isAdmin && (
        <section className="card grid grid-cols-1 gap-4 md:grid-cols-4">
          <h2 className="h2 md:col-span-4">Admin</h2>
          <Select label="Status" name="status" value={e?.status ?? "New Order"} options={opts(STATUSES)} />
          <Select label="Chat run by" name="handled_by" value={e?.handled_by} options={opts(HANDLED_BY)} />
          <Field label="Budget" name="budget" value={e?.budget} placeholder="$4,900" />
          <div />
          <div className="md:col-span-2"><Field label="Ad copy (Google Doc link)" name="ad_copy_url" type="url" value={e?.ad_copy_url} placeholder="https://docs.google.com/document/d/…" /></div>
          <div className="md:col-span-2"><Field label="Ad images (Google Drive folder link)" name="images_url" type="url" value={e?.images_url} placeholder="https://drive.google.com/drive/folders/…" /></div>
          <div className="md:col-span-2"><Field label="Retargeting (Google Sheet link)" name="retargeting_url" type="url" value={e?.retargeting_url} placeholder="https://docs.google.com/spreadsheets/d/…" /></div>
          <div className="md:col-span-2" />
          <div className="md:col-span-2"><Area label="Internal notes" name="internal_notes" value={e?.internal_notes} /></div>
          <div className="md:col-span-2"><Area label="Meta Ads notes (campaign, schedule)" name="meta_notes" value={e?.meta_notes} /></div>
        </section>
      )}

      <div><button className="btn btn-primary">{e ? "Save event" : "Create event"}</button></div>
    </form>
  );
}

/** Read-only dealership details so the event can be double-checked. Edit them on the dealership record. */
function DealerInfo({ d, editHref }: { d: DealerOption; editHref: string }) {
  const missing = <span className="text-orange-600">Not set</span>;
  const site = d.website && (/^https?:\/\//.test(d.website) ? d.website : `https://${d.website}`);
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/60 p-4 text-sm md:col-span-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-900">Dealership details — please verify</span>
        <a className="link text-xs" href={editHref} target="_blank" rel="noreferrer">Edit dealership ↗</a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div>
          <div className="label">Address</div>
          {d.street || d.cityLine ? (<>{d.street && <div>{d.street}</div>}{d.cityLine && <div>{d.cityLine}</div>}</>) : missing}
        </div>
        <div>
          <div className="label">Phone</div>
          {d.phone || missing}
        </div>
        <div>
          <div className="label">Ask for on arrival</div>
          {d.ask_for || missing}
        </div>
        <div className="min-w-0">
          <div className="label">Website</div>
          {site ? <a className="link break-all" href={site} target="_blank" rel="noreferrer">{d.website!.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a> : missing}
        </div>
        <div>
          <div className="label">Hours</div>
          {d.hours.length ? d.hours.map((h) => <div key={h}>{h}</div>) : missing}
        </div>
      </div>
    </div>
  );
}
