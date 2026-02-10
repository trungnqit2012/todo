import { useAuth } from "./hooks/useAuth";
import { signOut } from "./api/authApi";
import AuthForm from "./AuthForm";
import TodoApp from "./TodoApp";

function App() {
  const { user, loading } = useAuth();

  // ⛔ Chặn render khi session chưa hydrate xong
  if (loading) {
    return <p>Initializing session...</p>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <span>{user.email}</span>
        <button onClick={signOut} style={{ marginLeft: 12 }}>
          Logout
        </button>
      </header>

      <TodoApp />
    </div>
  );
}

export default App;
