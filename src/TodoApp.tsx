import { useState, useEffect, useRef } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";
import { ConfirmDialog } from "./ui/ConfirmDialog";

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

/* ---------- empty state helper ---------- */
function getEmptyStateContent(filter: "all" | "active" | "completed") {
  switch (filter) {
    case "active":
      return {
        title: "No active todos 🎉",
        description: "You’ve completed everything. Nice work!",
      };
    case "completed":
      return {
        title: "No completed todos yet",
        description: "Finish some tasks and they’ll show up here.",
      };
    default:
      return {
        title: "No todos yet",
        description: "Add your first todo above 👆",
      };
  }
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
  const [showHint, setShowHint] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const paginationDisabled = hasPendingDelete;

  const handleAdd = async () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  useEffect(() => {
    if (!isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div>
      <TodoInput
        ref={inputRef}
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
          onClearCompleted={() => {
            if (completedCount === 0) return;
            setShowClearConfirm(true);
          }}
        />
      </div>

      {todos.length === 0 ? (
        <EmptyState {...getEmptyStateContent(filter)} />
      ) : (
        <>
          {/* TODO LIST (focus target) */}
          <div ref={listRef} tabIndex={-1}>
            <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
          </div>

          {/* ---------- PAGINATION ---------- */}
          {totalPages > 1 && (
            <div
              className="relative flex justify-center mt-6"
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}
            >
              {/* TOOLTIP */}
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
                  {paginationDisabled
                    ? "Finish undo action first"
                    : "Use ← → to navigate"}
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={prevPage}
                  disabled={page === 1 || paginationDisabled}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

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
                      onClick={() => !paginationDisabled && setPage(item)}
                      disabled={paginationDisabled}
                      className={`
                          w-9 h-9 rounded-lg text-sm font-medium
                          ${
                            item === page
                              ? "bg-blue-500 text-white"
                              : "bg-slate-100 hover:bg-slate-200"
                          }
                          ${
                            paginationDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }
                        `}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  onClick={nextPage}
                  disabled={page === totalPages || paginationDisabled}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------- CLEAR CONFIRM POPUP ---------- */}
      <ConfirmDialog
        open={showClearConfirm}
        title={`Clear ${completedCount} completed todo${
          completedCount > 1 ? "s" : ""
        }?`}
        description="This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearCompleted();
          setShowClearConfirm(false);
          listRef.current?.focus();
        }}
      />
    </div>
  );
}
