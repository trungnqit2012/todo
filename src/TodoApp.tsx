import { useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";

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
    nextPage,
    prevPage,
  } = useTodos();

  const [text, setText] = useState("");

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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-100
                           disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-slate-600">
                Page {page} / {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-100
                           disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
