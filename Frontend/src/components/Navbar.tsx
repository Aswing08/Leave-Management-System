import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authStore";

type NavbarProps = {
  title: string;
  subtitle?: string;
};

export default function Navbar({ title, subtitle }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-full bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
