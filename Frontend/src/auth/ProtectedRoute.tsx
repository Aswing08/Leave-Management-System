import { Navigate } from "react-router-dom";
import { getRole, isLoggedIn } from "./authStore";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getRole();
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return <>{children}</>; //renders protected components
}
