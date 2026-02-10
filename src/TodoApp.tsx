import { useState } from "react";
import { useTodos } from "./hooks/useTodos";

export default function TodoApp() {
  const {
    todos,
    itemsLeft,
    loading,
    error,
    filter,
    setFilter,
    add,
    toggle,
    remove,
  } = useTodos();

  const [text, setText] = useState("");

  if (loading) return <p>Loading todos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ marginTop: 24 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          add(text);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button>Add</button>
      </form>

      <p>{itemsLeft} items left</p>

      <div>
        <button onClick={() => setFilter("all")} disabled={filter === "all"}>
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          disabled={filter === "active"}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          disabled={filter === "completed"}
        >
          Completed
        </button>
      </div>

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
