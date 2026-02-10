import { useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { TodoInput } from "./ui/TodoInput";
import { TodoFilter } from "./ui/TodoFilter";
import { TodoList } from "./ui/TodoList";
import { EmptyState } from "./ui/EmptyState";

export default function TodoApp() {
  const { todos, filter, setFilter, itemsLeft, add, toggle, remove, isAdding } =
    useTodos();

  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    add(text);
    setText("");
  };

  return (
    <div>
      {/* INPUT + ADD BUTTON */}
      <TodoInput
        value={text}
        onChange={setText}
        onSubmit={handleAdd}
        isAdding={isAdding}
      />

      {/* FOOTER */}
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <span>{itemsLeft} items left</span>
        <TodoFilter value={filter} onChange={setFilter} />
      </div>

      {/* LIST / EMPTY */}
      {todos.length === 0 ? (
        <EmptyState />
      ) : (
        <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
      )}
    </div>
  );
}
