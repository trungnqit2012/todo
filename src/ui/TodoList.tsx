import { TodoItem } from "./TodoItem";

/**
 * Todo dành cho UI
 * KHÔNG phụ thuộc DB fields
 */
export type UITodo = {
  id: string;
  title: string;
  completed: boolean;
  pendingDelete?: boolean;
};

type Props = {
  todos: UITodo[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TodoList({ todos, onToggle, onDelete }: Props) {
  return (
    <ul
      className="
        space-y-2
        transition-opacity duration-200
        animate-[fadeIn_0.2s_ease-out]
      "
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
