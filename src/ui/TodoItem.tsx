import clsx from "clsx";

/**
 * Todo dành cho UI
 * KHÔNG phụ thuộc DB fields (created_at)
 */
export type UITodo = {
  id: string;
  title: string;
  completed: boolean;
  pendingDelete?: boolean;
};

type Props = {
  todo: UITodo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li
      className={clsx(
        "flex items-center justify-between px-3 py-2 rounded-xl transition",
        "hover:bg-slate-50",
        todo.pendingDelete ? "todo-exit opacity-40 line-through" : "todo-enter",
      )}
    >
      {/* LEFT */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={todo.pendingDelete}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          className="sr-only"
        />

        {/* Custom checkbox */}
        <span
          className={clsx(
            "w-5 h-5 rounded-full border flex items-center justify-center",
            "transition",
            todo.completed ? "bg-blue-500 border-blue-500" : "border-slate-300",
            todo.pendingDelete && "opacity-50 cursor-not-allowed",
          )}
        >
          {todo.completed && (
            <span className="text-white text-sm checkbox-pop">✓</span>
          )}
        </span>

        {/* Title */}
        <span
          className={clsx(
            "select-none",
            todo.completed && "line-through text-slate-400",
          )}
        >
          {todo.title}
        </span>
      </label>

      {/* RIGHT */}
      <button
        onClick={() => onDelete(todo.id)}
        disabled={todo.pendingDelete}
        className="text-slate-400 hover:text-red-500
                   disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Delete todo"
      >
        ✕
      </button>
    </li>
  );
}
