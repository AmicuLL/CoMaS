import { useLocation, Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles, allowedPermissions }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess =
    allowedRoles?.some((role) =>
      auth.roles == undefined ? navigate("/login") : auth?.roles.includes(role)
    ) ||
    allowedPermissions?.some((permission) =>
      auth.permissions == undefined
        ? navigate("/login")
        : auth?.permissions.includes(permission)
    );
  return hasAccess ? (
    <Outlet />
  ) : auth?.access_token ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
