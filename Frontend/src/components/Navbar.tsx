import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">
      <h3>LeaveMS</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
