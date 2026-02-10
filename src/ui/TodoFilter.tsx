import type { Filter } from "../types/filter";

export function TodoFilter({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  const base = "px-3 py-1 rounded-lg text-sm transition";

  const active = "bg-blue-500 text-white";

  const inactive = "text-slate-500 hover:bg-slate-100";

  return (
    <div className="flex gap-2">
      {(["all", "active", "completed"] as Filter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`${base} ${value === f ? active : inactive}`}
        >
          {f[0].toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}
