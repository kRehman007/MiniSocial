import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { URL } from "@/lib/URL";
import { useAuthStore } from "@/zustand/useAuthStore";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to={URL.LOGIN} replace />;
  }

  return children;
}

export default ProtectedRoute;