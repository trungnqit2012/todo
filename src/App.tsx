import { useAuth } from "./hooks/useAuth";
import { signOut } from "./api/authApi";
import AuthForm from "./AuthForm";
import TodoApp from "./TodoApp";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading session...</p>;

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div style={{ padding: 24 }}>
      <header>
        <p>Hi {user.email}</p>
        <button onClick={signOut}>Logout</button>
      </header>

      <TodoApp />
    </div>
  );
}

export default App;
