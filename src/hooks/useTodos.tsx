import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- init from URL ---------- */

  const initialFilter = (searchParams.get("filter") as Filter) || "all";
  const initialPage = Number(searchParams.get("page")) || 1;

  /* ---------- state ---------- */

  const [allTodos, setAllTodos] = useState<UITodo[]>([]);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  /* ---------- paging ---------- */

  const [page, setPage] = useState(initialPage);
  const PAGE_SIZE = APP_CONFIG.PAGE_SIZE;
  const UNDO_TIMEOUT = APP_CONFIG.UNDO_TIMEOUT;

  const pendingDeletes = useRef<Map<string, number>>(new Map());

  /* ---------- sync URL ---------- */

  useEffect(() => {
    setSearchParams({
      page: String(page),
      filter,
    });
  }, [page, filter, setSearchParams]);

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

  /* ---------- paging logic ---------- */

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));

  const pagedTodos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTodos.slice(start, start + PAGE_SIZE);
  }, [filteredTodos, page, PAGE_SIZE]);

  // reset page khi đổi filter
  useEffect(() => {
    setPage(1);
  }, [filter]);

  /* ---------- auto fallback page when current page is empty ---------- */
  useEffect(() => {
    if (page <= 1) return;

    if (pagedTodos.length === 0) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [pagedTodos, page]);

  /* ---------- keyboard pagination (← →) ---------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setPage((p) => Math.max(p - 1, 1));
      }

      if (e.key === "ArrowRight") {
        setPage((p) => Math.min(p + 1, totalPages));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalPages]);

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

    const optimisticTodo: OptimisticTodo = {
      id: tempId,
      title: trimmed,
      completed: false,
      optimistic: true,
    };

    setAllTodos((prev) => [optimisticTodo, ...prev]);

    const toastId = toast.loading("Adding todo...");

    try {
      const saved = await addTodo(trimmed);
      setAllTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));

      toast.success("Todo added", { id: toastId });

      // UX: add xong quay về page 1
      setPage(1);
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
