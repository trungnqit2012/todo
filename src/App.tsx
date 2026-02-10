import { useState } from "react";
import { useTodos } from "./hooks/useTodos";

function App() {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Todo</h1>

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
          placeholder="Nhập việc cần làm..."
        />
        <button>Add</button>
      </form>

      <p>{itemsLeft} items left</p>

      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <p>Current filter: {filter}</p>
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

export default App;
