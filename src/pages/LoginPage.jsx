import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setError("");

    const result = login(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    const redirectTarget = location.state?.from || "/";
    navigate(redirectTarget, { replace: true });
  };

  return (
    <section className="card auth-card">
      <h1>Kirish</h1>
      <p className="muted">Tizimga login va parol bilan kiring.</p>
      <form onSubmit={submit} className="form-grid">
        <label>
          Login
          <input
            type="text"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="Login kiriting"
            required
          />
        </label>
        <label>
          Parol
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="********"
            required
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit">Tizimga kirish</button>
      </form>
    </section>
  );
}
