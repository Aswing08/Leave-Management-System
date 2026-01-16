import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      navigate("/login");
    } catch (error: any) {
      setErr(error?.response?.data?.detail || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-950 text-white">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-gray-900 p-6 rounded-2xl shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {err && <p className="text-red-400 mb-3">{err}</p>}

        <input
          className="w-full p-3 rounded-xl bg-gray-800 mb-3 outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl bg-gray-800 mb-3 outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="w-full p-3 rounded-xl bg-gray-800 mb-3 outline-none"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          
        </select>

        <input
          type="password"
          className="w-full p-3 rounded-xl bg-gray-800 mb-4 outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-semibold">
          Register
        </button>

        <p className="mt-4 text-center text-gray-300">
          Already have account?{" "}
          <Link className="text-blue-400 underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
