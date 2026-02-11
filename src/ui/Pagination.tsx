import { UI_TEXT } from "./uiText";

type Props = {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

/* ---------- pagination helper ---------- */
function getPagination(current: number, total: number) {
  const pages: (number | "...")[] = [];
  const delta = 1;

  const range = (start: number, end: number) => {
    for (let i = start; i <= end; i++) pages.push(i);
  };

  pages.push(1);

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) pages.push("...");
  range(left, right);
  if (right < total - 1) pages.push("...");

  if (total > 1) pages.push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  disabled = false,
  onPageChange,
  onPrev,
  onNext,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="relative flex justify-center mt-6 group">
      {/* TOOLTIP */}
      <div
        className="
          absolute -top-9
          px-3 py-1 rounded-md
          text-xs text-white
          bg-slate-800
          opacity-0
          pointer-events-none
          transition
          group-hover:opacity-100
        "
      >
        {disabled
          ? UI_TEXT.pagination.hint.disabled
          : UI_TEXT.pagination.hint.normal}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* PREV */}
        <button
          onClick={onPrev}
          disabled={page === 1 || disabled}
          className="
            px-3 py-1.5 rounded-lg bg-slate-100
            hover:bg-slate-200
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {UI_TEXT.pagination.prev}
        </button>

        {/* PAGE NUMBERS */}
        {getPagination(page, totalPages).map((item, idx) =>
          item === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-slate-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={`page-${item}-${idx}`}
              disabled={disabled}
              onClick={() => !disabled && onPageChange(item)}
              className={`
                  w-9 h-9 rounded-lg text-sm font-medium
                  ${
                    item === page
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }
                  ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
            >
              {item}
            </button>
          ),
        )}

        {/* NEXT */}
        <button
          onClick={onNext}
          disabled={page === totalPages || disabled}
          className="
            px-3 py-1.5 rounded-lg bg-slate-100
            hover:bg-slate-200
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {UI_TEXT.pagination.next}
        </button>
      </div>
    </div>
  );
}
