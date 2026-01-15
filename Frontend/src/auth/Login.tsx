import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ⛔ prevents refresh
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email); // MUST be "username"
      formData.append("password", password);

      const response = await axios.post(
        "http://127.0.0.1:8080/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Save token & role
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      // Redirect
      if (response.data.role === "admin") navigate("/admin");
      else if (response.data.role === "manager") navigate("/manager");
      else navigate("/employee");

    } catch (err: any) {
      console.error(err.response?.data);
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

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

        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
