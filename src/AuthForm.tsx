import { useState } from "react";
import { signIn, signUp } from "./api/authApi";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // DEV MODE (confirm email OFF)
    if (!data.session) {
      setError("User created. Please login.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 24, maxWidth: 320 }}>
      <h1>Todo</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            Login
          </button>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            style={{ marginLeft: 8 }}
          >
            Register
          </button>
        </div>
      </form>

      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
