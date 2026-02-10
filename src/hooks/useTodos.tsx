import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "../api/todoApi";
import type { Filter } from "../types/filter";
import type { Todo, TodoInsert } from "../types/todo";

/* ================= TYPES ================= */

type OptimisticTodo = TodoInsert & {
  optimistic: true;
};

type PendingDeleteState = {
  pendingDelete?: boolean;
};

type UITodo = (Todo | OptimisticTodo) & PendingDeleteState;

/* ================= CONSTANTS ================= */

const UNDO_TIMEOUT = 4000; // ms

export function useTodos() {
  const [todos, setTodos] = useState<UITodo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // id -> timer
  const pendingDeletes = useRef<Map<string, number>>(new Map());

  /* ================= LOAD TODOS ================= */

  useEffect(() => {
    getTodos()
      .then((data) => setTodos(data))
      .catch(() => toast.error("Failed to load todos"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= DERIVED STATE ================= */

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((t) => !t.completed && !t.pendingDelete);
    }
    if (filter === "completed") {
      return todos.filter((t) => t.completed && !t.pendingDelete);
    }
    return todos;
  }, [todos, filter]);

  const itemsLeft = useMemo(
    () => todos.filter((t) => !t.completed && !t.pendingDelete).length,
    [todos],
  );

  /* ================= ADD TODO ================= */

  const add = async (title: string) => {
    if (isAdding) return;

    setIsAdding(true);

    const tempId = crypto.randomUUID();

    const optimisticTodo: OptimisticTodo = {
      id: tempId,
      title,
      completed: false,
      optimistic: true,
    };

    setTodos((prev) => [optimisticTodo, ...prev]);

    const toastId = toast.loading("Adding todo...");

    try {
      const saved = await addTodo(title);

      setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));

      toast.success("Todo added", { id: toastId });
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      toast.error("Failed to add todo", {
        id: toastId,
      });
    } finally {
      setIsAdding(false);
    }
  };

  /* ================= TOGGLE TODO ================= */

  const toggle = async (id: string, completed: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t)),
    );

    try {
      await toggleTodo(id, completed);
    } catch {
      toast.error("Failed to update todo");
    }
  };

  /* ================= DELETE WITH UNDO ================= */

  const remove = (id: string) => {
    // mark pending delete
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pendingDelete: true } : t)),
    );

    const timer = window.setTimeout(async () => {
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        toast.error("Failed to delete todo");
        // rollback pending state
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, pendingDelete: false } : t)),
        );
      } finally {
        pendingDeletes.current.delete(id);
      }
    }, UNDO_TIMEOUT);

    pendingDeletes.current.set(id, timer);

    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Todo deleted</span>
          <button
            className="font-medium text-blue-600 hover:underline"
            onClick={() => undoDelete(id, t.id)}
          >
            Undo
          </button>
        </div>
      ),
      { duration: UNDO_TIMEOUT },
    );
  };

  const undoDelete = (id: string, toastId: string) => {
    const timer = pendingDeletes.current.get(id);
    if (!timer) return;

    clearTimeout(timer);

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pendingDelete: false } : t)),
    );

    pendingDeletes.current.delete(id);
    toast.dismiss(toastId);
    toast.success("Undo successful");
  };

  return {
    todos: filteredTodos,
    loading,
    filter,
    setFilter,
    itemsLeft,
    add,
    toggle,
    remove,
    isAdding,
  };
}
