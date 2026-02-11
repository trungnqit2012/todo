import { useState } from "react";
import { signIn, signUp } from "./api/authApi";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await signIn(email.trim(), password.trim());

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await signUp(email.trim(), password.trim());

    console.log("SIGN UP RESULT:", { data, error });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Nếu Confirm email đang bật
    if (!data.session) {
      setError("Account created. Please check your email to confirm.");
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
          style={{ display: "block", marginBottom: 8, width: "100%" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: 8, width: "100%" }}
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
