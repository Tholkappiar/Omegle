import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { userSession, sessionLoading } = useAuth();

    const isAuthenticated = !!userSession?.user;

    if (sessionLoading) {
        return <div>Loading...</div>;
    }

    console.log("Authenticated: ", userSession);
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
