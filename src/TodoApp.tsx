import { useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";

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

export default function TodoApp() {
  const {
    todos,
    filter,
    setFilter,
    itemsLeft,
    completedCount,
    hasPendingDelete,
    add,
    toggle,
    remove,
    clearCompleted,
    isAdding,

    page,
    totalPages,
    setPage,
    nextPage,
    prevPage,
  } = useTodos();

  const [text, setText] = useState("");

  // tooltip hover state
  const [showHint, setShowHint] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  return (
    <div>
      <TodoInput
        value={text}
        onChange={setText}
        onSubmit={handleAdd}
        isAdding={isAdding}
      />

      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <span>{itemsLeft} items left</span>

        <TodoFilter
          value={filter}
          onChange={setFilter}
          completedCount={completedCount}
          disabled={hasPendingDelete}
          onClearCompleted={clearCompleted}
        />
      </div>

      {todos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TodoList todos={todos} onToggle={toggle} onDelete={remove} />

          {/* ---------- PAGINATION ---------- */}
          {totalPages > 1 && (
            <div
              className="relative flex justify-center mt-6"
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}
            >
              {/* TOOLTIP – HOVER SHOW */}
              {showHint && (
                <div
                  style={{
                    position: "absolute",
                    top: "-36px",
                    background: "#1e293b",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    zIndex: 50,
                  }}
                >
                  Use ← → to navigate
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* PREV */}
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className="
                    px-3 py-1.5 rounded-lg bg-slate-100
                    cursor-pointer hover:bg-slate-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Prev
                </button>

                {/* PAGE NUMBERS + ELLIPSIS */}
                {getPagination(page, totalPages).map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-400 select-none cursor-default"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={`page-${item}-${idx}`}
                      onClick={() => setPage(item)}
                      className={`
                          w-9 h-9 rounded-lg text-sm font-medium
                          ${
                            item === page
                              ? "bg-blue-500 text-white cursor-default"
                              : "bg-slate-100 hover:bg-slate-200 cursor-pointer"
                          }
                        `}
                    >
                      {item}
                    </button>
                  ),
                )}

                {/* NEXT */}
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className="
                    px-3 py-1.5 rounded-lg bg-slate-100
                    cursor-pointer hover:bg-slate-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
