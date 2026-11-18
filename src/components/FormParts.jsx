// Komponen kecil yang dipakai bersama oleh form IEM dan form DAC/Amp.

export function FormPanel({ title, hint, children }) {
  return (
    <section className="panel form-panel">
      <h2>{title}</h2>
      {hint && <p className="hint">{hint}</p>}
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function Field({ label, hint, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {hint && <small className="hint">{hint}</small>}
    </label>
  );
}

export function Area({ label, hint, rows = 3, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={rows} {...props} />
      {hint && <small className="hint">{hint}</small>}
    </label>
  );
}

// Pilihan tunggal berbentuk chip. Dengan allowClear, klik chip yang sedang
// dipilih akan mengosongkan pilihan (untuk field opsional).
export function ChoiceChips({
  legend,
  options,
  value,
  onChange,
  allowClear = false,
  hint
}) {
  return (
    <fieldset className="chipgroup">
      <legend>{legend}</legend>
      <div className="chips">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              type="button"
              key={String(o.value)}
              className={"chip pick choice" + (on ? " on" : "")}
              aria-pressed={on}
              onClick={() => onChange(on && allowClear ? "" : o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <small className="hint">{hint}</small>}
    </fieldset>
  );
}

// Pilihan jamak (Tuning / Genre). kind: "tuning" atau "genre"
export function ChipPicker({ legend, items, selected, onToggle, kind, emptyText }) {
  return (
    <fieldset className="chipgroup">
      <legend>{legend}</legend>
      {items.length === 0 && <p className="muted">{emptyText}</p>}
      <div className="chips">
        {items.map((it) => {
          const on = selected.includes(it.id);
          return (
            <button
              type="button"
              key={it.id}
              className={`chip pick ${kind}` + (on ? " on" : "")}
              aria-pressed={on}
              onClick={() => onToggle(it.id)}
            >
              {it.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
