import { useTodosCore } from "./useTodosCore";
import { useTodoFilter } from "./useTodoFilter";
import { useTodoPagination } from "./useTodoPagination";

export function useTodos() {
  /* ---------- core ---------- */
  const core = useTodosCore();

  /* ---------- filter ---------- */
  const filterState = useTodoFilter({
    todos: core.todos,
  });

  /* ---------- pagination ---------- */
  const pagination = useTodoPagination({
    items: filterState.filteredTodos,
  });

  return {
    /* ----- todos data ----- */
    todos: pagination.pagedItems,
    loading: core.loading,

    /* ----- filter ----- */
    filter: filterState.filter,
    setFilter: filterState.setFilter,

    /* ----- stats ----- */
    itemsLeft: core.itemsLeft,
    completedCount: core.completedCount,
    hasPendingDelete: core.hasPendingDelete,

    /* ----- actions ----- */
    add: core.add,
    toggle: core.toggle,
    remove: core.remove,
    clearCompleted: core.clearCompleted,
    isAdding: core.isAdding,

    /* ----- pagination ----- */
    page: pagination.page,
    totalPages: pagination.totalPages,
    setPage: pagination.setPage,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
  };
}
