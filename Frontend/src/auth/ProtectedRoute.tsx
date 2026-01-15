import { Navigate } from "react-router-dom";
import type{ ReactNode } from "react";

type Props = {
  children: ReactNode;
  role: string;
};

export default function ProtectedRoute({ children, role }: Props) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || !userRole || userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
