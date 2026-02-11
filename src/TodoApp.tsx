import { useState, useRef, useEffect } from "react";
import { useTodos } from "./hooks/useTodos";
import { useConfirmClearCompleted } from "./hooks/useConfirmClearCompleted";

import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Pagination } from "./ui/Pagination";
import { getEmptyStateContent } from "./ui/emptyStateContent";

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

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ---------- confirm clear hook ---------- */
  const clearConfirm = useConfirmClearCompleted({
    completedCount,
    onConfirm: () => {
      clearCompleted();
      listRef.current?.focus();
    },
  });

  /* ---------- add ---------- */
  const handleAdd = () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  /* ---------- focus back to input after add ---------- */
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
          onClearCompleted={clearConfirm.openConfirm}
        />
      </div>

      {todos.length === 0 ? (
        <EmptyState {...getEmptyStateContent(filter)} />
      ) : (
        <>
          {/* TODO LIST */}
          <div ref={listRef} tabIndex={-1}>
            <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
          </div>

          {/* PAGINATION */}
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={hasPendingDelete}
            onPageChange={setPage}
            onPrev={prevPage}
            onNext={nextPage}
          />
        </>
      )}

      {/* CLEAR COMPLETED CONFIRM */}
      <ConfirmDialog
        open={clearConfirm.open}
        title={`Clear ${completedCount} completed todo${
          completedCount > 1 ? "s" : ""
        }?`}
        description="This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        onCancel={clearConfirm.closeConfirm}
        onConfirm={clearConfirm.confirm}
      />
    </div>
  );
}
