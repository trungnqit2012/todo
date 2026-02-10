import clsx from "clsx";
import { useCallback, useState } from "react";
import { Tooltip } from "./Tooltip";

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
  const isDeleting = todo.pendingDelete;

  const [isClamped, setIsClamped] = useState(false);

  // ✅ Callback ref — đo DOM đúng cách, không effect
  const titleRef = useCallback((el: HTMLSpanElement | null) => {
    if (!el) return;

    const isOverflowing =
      el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;

    // ❗ chỉ setState khi THỰC SỰ đổi
    setIsClamped((prev) => (prev !== isOverflowing ? isOverflowing : prev));
  }, []);

  const titleNode = (
    <span
      ref={titleRef}
      className={clsx(
        "block text-sm select-none",
        "line-clamp-1 sm:line-clamp-2",
        todo.completed && "line-through text-slate-400",
      )}
    >
      {todo.title}
    </span>
  );

  return (
    <li
      className={clsx(
        "flex items-start justify-between gap-3 px-3 py-2 rounded-xl transition-all",
        "hover:bg-slate-50",
        isDeleting && "opacity-50 line-through pointer-events-none",
      )}
    >
      {/* LEFT */}
      <label className="flex items-start gap-3 cursor-pointer min-w-0 flex-1">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={isDeleting}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
          className="sr-only"
        />

        {/* Checkbox */}
        <span
          className={clsx(
            "mt-1 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition",
            todo.completed ? "bg-blue-500 border-blue-500" : "border-slate-300",
          )}
        >
          {todo.completed && (
            <span className="text-white text-sm checkbox-pop">✓</span>
          )}
        </span>

        {/* TITLE */}
        {isClamped ? (
          <Tooltip content={todo.title}>{titleNode}</Tooltip>
        ) : (
          titleNode
        )}
      </label>

      {/* RIGHT */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {isDeleting ? (
          <span
            className="
              w-4 h-4
              border-2 border-slate-300
              border-t-slate-500
              rounded-full
              animate-spin
            "
          />
        ) : (
          <Tooltip content="Delete todo">
            <button
              onClick={() => onDelete(todo.id)}
              className="
                text-slate-400 hover:text-red-500
                transition
              "
              aria-label={`Delete todo ${todo.title}`}
            >
              ✕
            </button>
          </Tooltip>
        )}
      </div>
    </li>
  );
}
