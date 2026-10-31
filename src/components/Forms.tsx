import { saveDealership } from "@/app/actions";
import { DAYS, TIMEZONES } from "@/lib/constants";
import type { Client, Dealership } from "@/lib/queries";
import { Area, Field, Select } from "./FormFields";

export function DealershipForm({ d, isAdmin, clients, returnTo }: { d?: Dealership; isAdmin: boolean; clients: Client[]; returnTo?: string }) {
  return (
    <form action={saveDealership} className="flex flex-col gap-6">
      {d && <input type="hidden" name="id" value={d.id} />}
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

      <section className="card grid grid-cols-1 gap-4 md:grid-cols-6">
        <h2 className="h2 md:col-span-6">Dealership</h2>
        <Field label="Dealer name" name="name" value={d?.name} className="md:col-span-3" required />
        <Field label="Auto brand" name="auto_brand" value={d?.auto_brand} placeholder="Kia" className="md:col-span-2" />
        {isAdmin && clients.length > 1 ? (
          <Select label="Client" name="client_id" value={d?.client_id} options={clients.map((c) => ({ value: c.id, label: c.name }))} className="md:col-span-1" />
        ) : null}
        <Field label="Street" name="street" value={d?.street} className="md:col-span-3" />
        <Field label="City" name="city" value={d?.city} className="md:col-span-1" />
        <Field label="State" name="state" value={d?.state} placeholder="NM" className="md:col-span-1" />
        <Field label="Zip" name="zip" value={d?.zip} className="md:col-span-1" />
        <Field label="Contact phone" name="phone" value={d?.phone} className="md:col-span-2" />
        <Select label="Timezone" name="timezone" value={d?.timezone} options={[{ value: "", label: "Auto from state" }, ...TIMEZONES]} className="md:col-span-2" />
        <Field label="Ask for on arrival" name="ask_for" value={d?.ask_for} placeholder="Cory or Matt" className="md:col-span-2" />
      </section>

      <section className="card">
        <h2 className="h2 mb-1">Dealership hours</h2>
        <p className="mb-3 text-xs text-gray-500">e.g. &quot;8am-6pm&quot; or &quot;Closed&quot;. The time zone is added automatically on the BDC summary.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
          {DAYS.map((day) => <Field key={day.key} label={day.label} name={`hours_${day.key}`} value={d?.[`hours_${day.key}` as keyof Dealership] as string} />)}
        </div>
      </section>

      <section className="card grid grid-cols-1 gap-4 md:grid-cols-2">
        <h2 className="h2 md:col-span-2">Links &amp; leads</h2>
        <Field label="Store website" name="website" value={d?.website} />
        <Field label="New car link" name="new_inventory_url" value={d?.new_inventory_url} />
        <Field label="Used car link" name="used_inventory_url" value={d?.used_inventory_url} />
        <Field label="Finance link" name="finance_url" value={d?.finance_url} />
        <Field label="CRM lead address" name="crm_lead_email" value={d?.crm_lead_email} />
        <Field label="XML lead address" name="xml_lead_email" value={d?.xml_lead_email} />
      </section>

      <section className="card grid grid-cols-1 gap-4 md:grid-cols-2">
        <h2 className="h2 md:col-span-2">Contacts &amp; notes</h2>
        <Area label="Contacts" name="contacts" value={d?.contacts} rows={4} placeholder={"GM: Name — email — phone\nBDC Director: …\nInternet Manager: …"} />
        <Area label="Notes" name="notes" value={d?.notes} rows={4} />
        {isAdmin && <Area label="Setup notes (admin only)" name="setup_notes" value={d?.setup_notes} rows={2} />}
      </section>

      <div className="flex gap-2">
        <button className="btn btn-primary">{d ? "Save dealership" : "Add dealership"}</button>
      </div>
    </form>
  );
}
