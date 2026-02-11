import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "../api/todoApi";
import type { Todo, TodoInsert } from "../types/todo";
import { APP_CONFIG } from "../config/app.config";

/* ---------- types ---------- */

type OptimisticTodo = TodoInsert & {
  optimistic: true;
};

export type UITodo = (Todo | OptimisticTodo) & {
  pendingDelete?: boolean;
};

const UNDO_TIMEOUT = APP_CONFIG.UNDO_TIMEOUT;

export function useTodosCore() {
  const [todos, setTodos] = useState<UITodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const pendingDeletes = useRef<Map<string, number>>(new Map());

  /* ---------- load ---------- */
  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => toast.error("Failed to load todos"))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived stats ---------- */
  const itemsLeft = useMemo(
    () => todos.filter((t) => !t.completed && !t.pendingDelete).length,
    [todos],
  );

  const completedCount = useMemo(
    () => todos.filter((t) => t.completed && !t.pendingDelete).length,
    [todos],
  );

  const hasPendingDelete = useMemo(
    () => todos.some((t) => t.pendingDelete),
    [todos],
  );

  /* ---------- add ---------- */
  const add = async (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    if (trimmed.length > APP_CONFIG.MAX_TODO_TITLE_LENGTH) {
      toast.error(
        `Todo title must be ≤ ${APP_CONFIG.MAX_TODO_TITLE_LENGTH} characters`,
      );
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    const tempId = crypto.randomUUID();

    const optimistic: OptimisticTodo = {
      id: tempId,
      title: trimmed,
      completed: false,
      optimistic: true,
    };

    setTodos((prev) => [optimistic, ...prev]);

    const toastId = toast.loading("Adding todo...");

    try {
      const saved = await addTodo(trimmed);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      toast.success("Todo added", { id: toastId });
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      toast.error("Failed to add todo", { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  /* ---------- toggle ---------- */
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

  /* ---------- delete + undo ---------- */
  const remove = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pendingDelete: true } : t)),
    );

    const timer = window.setTimeout(async () => {
      try {
        await deleteTodo(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        toast.error("Failed to delete todo");
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

  /* ---------- clear completed ---------- */
  const clearCompleted = async () => {
    const completedIds = todos
      .filter((t) => t.completed && !t.pendingDelete)
      .map((t) => t.id);

    if (completedIds.length === 0) return;

    setTodos((prev) => prev.filter((t) => !completedIds.includes(t.id)));

    try {
      await Promise.all(completedIds.map((id) => deleteTodo(id)));
      toast.success("Completed todos cleared");
    } catch {
      toast.error("Failed to clear completed todos");
    }
  };

  return {
    todos,
    loading,
    isAdding,

    itemsLeft,
    completedCount,
    hasPendingDelete,

    add,
    toggle,
    remove,
    clearCompleted,
  };
}
