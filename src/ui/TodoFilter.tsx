import clsx from "clsx";
import type { Filter } from "../types/filter";
import { Tooltip } from "./Tooltip";

type Props = {
  value: Filter;
  onChange: (f: Filter) => void;
  completedCount: number;
  disabled?: boolean;
  onClearCompleted: () => void;
};

export function TodoFilter({
  value,
  onChange,
  completedCount,
  disabled = false,
  onClearCompleted,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={clsx(
              "px-2 py-1 text-sm rounded-md transition",
              value === f
                ? "bg-blue-500 text-white"
                : "text-slate-500 hover:bg-slate-100",
            )}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <Tooltip content="Clear completed todos">
          <button
            onClick={onClearCompleted}
            disabled={disabled}
            className={clsx(
              "text-sm transition",
              disabled
                ? "text-slate-300 cursor-not-allowed"
                : "text-red-400 hover:text-red-600",
            )}
          >
            Clear ({completedCount})
          </button>
        </Tooltip>
      )}
    </div>
  );
}
