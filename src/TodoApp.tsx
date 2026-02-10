import { useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { useAuth } from "./hooks/useAuth";

export default function TodoApp() {
  const { user } = useAuth();
  const { todos, add, toggle, remove } = useTodos();
  const [text, setText] = useState("");

  const disabled = !user;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || disabled) return;
          add(text);
          setText("");
        }}
      >
        <input
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            disabled ? "Initializing session..." : "What needs to be done?"
          }
        />
        <button disabled={disabled}>Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggle(todo.id, e.target.checked)}
              />
              {todo.title}
            </label>
            <button onClick={() => remove(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
