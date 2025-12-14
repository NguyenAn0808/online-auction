import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// allowedRoles: array of roles that can access this route (e.g. ['seller', 'admin'])
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  // 1. Check if user is logged in
  if (!user) {
    // Redirect to login, remembering where they tried to go
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // 2. Check if the CURRENT ACTIVE ROLE is allowed
  // If allowedRoles is not provided, we assume any logged-in user is allowed
  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    // If a Seller is "viewing as Bidder", they shouldn't see Seller pages
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
