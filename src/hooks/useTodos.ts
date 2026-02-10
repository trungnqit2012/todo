import { useEffect, useMemo, useState } from "react";
import type { Todo } from "../types/todo";
import type { Filter } from "../types/filter";
import * as api from "../api/todoApi";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load initial data
  useEffect(() => {
    api
      .getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ===== Optimistic ADD =====
  async function add(title: string) {
    const tempTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      created_at: new Date().toISOString(),
    };

    // optimistic UI
    setTodos((prev) => [tempTodo, ...prev]);

    try {
      const saved = await api.addTodo(title);
      setTodos((prev) => prev.map((t) => (t.id === tempTodo.id ? saved : t)));
    } catch (err) {
      console.error(err);
      setTodos((prev) => prev.filter((t) => t.id !== tempTodo.id));
      alert("❌ Add todo failed");
    }
  }

  // ===== Optimistic TOGGLE =====
  async function toggle(id: string, completed: boolean) {
    const prev = todos;

    setTodos((curr) =>
      curr.map((t) => (t.id === id ? { ...t, completed } : t)),
    );

    try {
      await api.toggleTodo(id, completed);
    } catch {
      setTodos(prev);
      alert("❌ Update failed");
    }
  }

  // ===== Optimistic DELETE =====
  async function remove(id: string) {
    const prev = todos;
    setTodos((curr) => curr.filter((t) => t.id !== id));

    try {
      await api.deleteTodo(id);
    } catch {
      setTodos(prev);
      alert("❌ Delete failed");
    }
  }

  // ===== Filtered Todos =====
  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const itemsLeft = todos.filter((t) => !t.completed).length;

  return {
    todos: visibleTodos,
    itemsLeft,
    loading,
    error,
    filter,
    setFilter,
    add,
    toggle,
    remove,
  };
}
