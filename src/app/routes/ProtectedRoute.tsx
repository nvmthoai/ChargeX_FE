import { Navigate, Outlet, useLocation } from "react-router-dom"

export default function ProtectedRoute() {
  const location = useLocation()

  const isAuthenticated = () => {
    // Check localStorage for token
    const token = localStorage.getItem("authToken")
    // Or check if user data exists
    const user = localStorage.getItem("user")

    return !!(token || user)
  }

  // If not authenticated, redirect to auth page with return URL
  if (!isAuthenticated()) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // If authenticated, render the protected content
  return <><Outlet/></>
}
