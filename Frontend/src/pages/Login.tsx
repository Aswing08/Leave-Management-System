import { useState } from "react";
import api from "../api/axios";
import { saveAuth } from "../auth/authStore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      saveAuth(res.data.access_token, res.data.role);

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "manager") navigate("/manager");
      else navigate("/employee");
    } catch (error: any) {
      setErr(error?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-gray-900 p-6 rounded-2xl shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {err && <p className="text-red-400 mb-3">{err}</p>}

        <input
          className="w-full p-3 rounded-xl bg-gray-800 mb-3 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded-xl bg-gray-800 mb-4 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"> 
          Login
        </button>

        <p className="mt-4 text-center text-gray-300">
          Don’t have account?{" "}
          <Link className="text-blue-400 underline" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
