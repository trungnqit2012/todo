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
        <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
      )}
    </div>
  );
}
