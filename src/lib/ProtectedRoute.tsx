import { useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { URL } from "./URL";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated]=useState(true)
  return (
    isAuthenticated?<Navigate to={URL.LOGIN} />:children
  )
}

export default ProtectedRoute