import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const isAuthenticated = !!(token || user);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // 👈 Quan trọng
}
