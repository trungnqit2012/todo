import { UITodo } from "./TodoList";
import { Tooltip } from "./Tooltip";

type Props = {
  todo: UITodo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li
      className={`
        flex items-center gap-3
        px-4 py-3 rounded-xl
        bg-slate-50
        transition-all duration-200 ease-out
        ${todo.pendingDelete ? "opacity-40 blur-[1px]" : ""}
        ${todo.completed ? "opacity-70 scale-[0.98]" : ""}
      `}
    >
      {/* CHECKBOX */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        className="
          w-4 h-4
          rounded-md
          border border-slate-300
          accent-blue-600
          cursor-pointer
          transition-all duration-150
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          active:scale-90
        "
      />

      {/* TITLE */}
      <span
        className={`
          flex-1 min-w-0 break-words
          transition-all duration-200
          ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}
        `}
      >
        {todo.title}
      </span>

      {/* DELETE WITH TOOLTIP */}
      <Tooltip content="Delete todo">
        <button
          onClick={() => onDelete(todo.id)}
          className="
            relative
            text-slate-400 hover:text-red-500
            transition-transform duration-150
            hover:scale-110
            active:scale-95 cursor-pointer
          "
        >
          ✕
        </button>
      </Tooltip>
    </li>
  );
}
