import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useTodos } from "./hooks/useTodos";
import { useConfirmClearCompleted } from "./hooks/useConfirmClearCompleted";

import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Pagination } from "./ui/Pagination";
import { getEmptyStateContent } from "./ui/emptyStateContent";
import { UI_TEXT } from "./ui/uiText";

export default function TodoApp() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ===============================
     ENSURE DEFAULT URL QUERY
  =============================== */

  useEffect(() => {
    const hasPage = searchParams.get("page");
    const hasFilter = searchParams.get("filter");

    if (!hasPage || !hasFilter) {
      const params = new URLSearchParams(searchParams);

      if (!hasPage) params.set("page", "1");
      if (!hasFilter) params.set("filter", "all");

      setSearchParams(params);
    }
  }, []); // 👈 chạy 1 lần khi mount

  /* ===============================
     ORIGINAL LOGIC
  =============================== */

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

  const clearConfirm = useConfirmClearCompleted({
    completedCount,
    onConfirm: () => {
      clearCompleted();
      listRef.current?.focus();
    },
  });

  const handleAdd = () => {
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
          onClearCompleted={clearConfirm.openConfirm}
        />
      </div>

      {todos.length === 0 ? (
        <EmptyState {...getEmptyStateContent(filter)} />
      ) : (
        <>
          <div ref={listRef} tabIndex={-1}>
            <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
          </div>

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

      <ConfirmDialog
        open={clearConfirm.open}
        title={UI_TEXT.confirm.clearCompleted.title(completedCount)}
        description={UI_TEXT.confirm.clearCompleted.description}
        confirmText={UI_TEXT.confirm.clearCompleted.confirm}
        cancelText={UI_TEXT.confirm.clearCompleted.cancel}
        onCancel={clearConfirm.closeConfirm}
        onConfirm={clearConfirm.confirm}
      />
    </div>
  );
}
