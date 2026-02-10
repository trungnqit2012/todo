import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "../api/todoApi";
import type { Filter } from "../types/filter";
import type { Todo, TodoInsert } from "../types/todo";
import { APP_CONFIG } from "../config/app.config";

/* ---------- types ---------- */

type OptimisticTodo = TodoInsert & {
  optimistic: true;
};

type PendingDeleteState = {
  pendingDelete?: boolean;
};

type UITodo = (Todo | OptimisticTodo) & PendingDeleteState;

/* ---------- hook ---------- */

export function useTodos() {
  /** 🔑 STATE GỐC – KHÔNG FILTER */
  const [allTodos, setAllTodos] = useState<UITodo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  /** 🔹 PAGING */
  const [page, setPage] = useState(1);

  const pendingDeletes = useRef<Map<string, number>>(new Map());

  const PAGE_SIZE = APP_CONFIG.PAGE_SIZE;
  const UNDO_TIMEOUT = APP_CONFIG.UNDO_TIMEOUT;

  /* ---------- load ---------- */

  useEffect(() => {
    getTodos()
      .then(setAllTodos)
      .catch(() => toast.error("Failed to load todos"))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- derived (VIEW ONLY) ---------- */

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return allTodos.filter((t) => !t.completed && !t.pendingDelete);
    }

    if (filter === "completed") {
      return allTodos.filter((t) => t.completed && !t.pendingDelete);
    }

    return allTodos;
  }, [allTodos, filter]);

  /* ---------- paging ---------- */

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));

  const pagedTodos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTodos.slice(start, start + PAGE_SIZE);
  }, [filteredTodos, page, PAGE_SIZE]);

  // reset page khi đổi filter
  useEffect(() => {
    setPage(1);
  }, [filter]);

  /* ---------- derived (GLOBAL STATS) ---------- */

  const itemsLeft = useMemo(
    () => allTodos.filter((t) => !t.completed && !t.pendingDelete).length,
    [allTodos],
  );

  const completedCount = useMemo(
    () => allTodos.filter((t) => t.completed && !t.pendingDelete).length,
    [allTodos],
  );

  const hasPendingDelete = useMemo(
    () => allTodos.some((t) => t.pendingDelete),
    [allTodos],
  );

  /* ---------- add ---------- */

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

    setAllTodos((prev) => [optimisticTodo, ...prev]);

    const toastId = toast.loading("Adding todo...");

    try {
      const saved = await addTodo(title);
      setAllTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      toast.success("Todo added", { id: toastId });
    } catch {
      setAllTodos((prev) => prev.filter((t) => t.id !== tempId));
      toast.error("Failed to add todo", { id: toastId });
    } finally {
      setIsAdding(false);
    }
  };

  /* ---------- toggle ---------- */

  const toggle = async (id: string, completed: boolean) => {
    setAllTodos((prev) =>
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
    setAllTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pendingDelete: true } : t)),
    );

    const timer = window.setTimeout(async () => {
      try {
        await deleteTodo(id);
        setAllTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        toast.error("Failed to delete todo");
        setAllTodos((prev) =>
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

    setAllTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pendingDelete: false } : t)),
    );

    pendingDeletes.current.delete(id);
    toast.dismiss(toastId);
    toast.success("Undo successful");
  };

  /* ---------- clear completed ---------- */

  const clearCompleted = async () => {
    const completedIds = allTodos
      .filter((t) => t.completed && !t.pendingDelete)
      .map((t) => t.id);

    if (completedIds.length === 0) return;

    setAllTodos((prev) => prev.filter((t) => !completedIds.includes(t.id)));

    try {
      await Promise.all(completedIds.map((id) => deleteTodo(id)));
      toast.success("Completed todos cleared");
    } catch {
      toast.error("Failed to clear completed todos");
    }
  };

  /* ---------- return ---------- */

  return {
    todos: pagedTodos,
    loading,

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

    // paging
    page,
    totalPages,
    setPage,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
