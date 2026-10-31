// Plain form inputs shared by the dealership and event forms (usable from server and client components).

export function Field({ label, name, value, type = "text", placeholder, className = "", required }: {
  label: string; name: string; value?: string | number | null; type?: string; placeholder?: string; className?: string; required?: boolean;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}{required && " *"}</label>
      <input id={name} name={name} type={type} defaultValue={value ?? ""} placeholder={placeholder} className="input" required={required} />
    </div>
  );
}

export function Area({ label, name, value, rows = 3, placeholder, help }: { label: string; name: string; value?: string | null; rows?: number; placeholder?: string; help?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={value ?? ""} placeholder={placeholder} className="input" />
      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function Select({ label, name, value, options, className = "" }: { label: string; name: string; value?: string | number | null; options: { value: string | number; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={value ?? ""} className="input">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export const opts = (xs: readonly string[]) => xs.map((x) => ({ value: x, label: x }));
