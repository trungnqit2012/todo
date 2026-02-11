import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Filter } from "../types/filter";
import type { UITodo } from "./useTodosCore";

type Options = {
  todos: UITodo[];
};

export function useTodoFilter({ todos }: Options) {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ---------- read filter from URL ---------- */

  const filter = (searchParams.get("filter") as Filter) || "all";

  /* ---------- update filter (sync URL) ---------- */

  const setFilter = (newFilter: Filter) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", newFilter);
    params.set("page", "1"); // reset page khi đổi filter
    setSearchParams(params);
  };

  /* ---------- derived ---------- */

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed && !t.pendingDelete);

      case "completed":
        return todos.filter((t) => t.completed && !t.pendingDelete);

      default:
        return todos;
    }
  }, [todos, filter]);

  return {
    filter,
    setFilter,
    filteredTodos,
  };
}
