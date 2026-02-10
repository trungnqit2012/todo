import { useAuth } from "./hooks/useAuth";
import { signOut } from "./api/authApi";
import AuthForm from "./AuthForm";
import TodoApp from "./TodoApp";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Initializing session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {/* TOAST ROOT */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#334155",
          },
        }}
      />

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Todo App 📝</h1>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{user.email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg cursor-pointer
                         bg-slate-100 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </header>

        <TodoApp />
      </div>
    </div>
  );
}

export default App;
