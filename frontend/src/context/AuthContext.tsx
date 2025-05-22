import { createContext, useContext, useEffect, useState } from "react";
import type {
    childrenProp,
    UserSession,
} from "../components/communication/types";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/utils";

type AuthContextType = {
    userSession: UserSession | null;
    setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
    sessionLoading: boolean;
};

const authContext = createContext<AuthContextType>({
    userSession: null,
    setUserSession: () => {},
    sessionLoading: false,
});

export const AuthProvider = ({ children }: childrenProp) => {
    const [userSession, setUserSession] = useState<UserSession | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const { useSession } = authClient;
    const navigate = useNavigate();
    const { data, isPending, error } = useSession();
    console.log("getting session value from server - in auth context ");
    useEffect(() => {
        setSessionLoading(isPending);

        if (isPending) return;

        if (error) {
            console.log("Error checking session:", error);
            setUserSession(null);
            setSessionLoading(false);
            return;
        }

        if (data?.session) {
            const expiresAt = new Date(data.session.expiresAt).getTime();
            const currentTime = Date.now();
            const delay = expiresAt - currentTime;

            if (delay <= 0) {
                // Session has already expired
                console.log("Session expired. Clearing session...");
                setUserSession(null);
                setSessionLoading(false);
                return;
            }

            // Update session and schedule auto-logout
            setUserSession(data);
            setSessionLoading(false);

            const timeout = setTimeout(() => {
                console.log("Session expired. Auto-logout triggered.");
                showToast("Session Expired, Please Login again !");
                setUserSession(null);
                navigate("/");
            }, delay);

            // Cleanup on component unmount
            return () => clearTimeout(timeout);
        } else {
            setUserSession(null);
            setSessionLoading(false);
        }
    }, [data, error, isPending, navigate, setUserSession]);

    if (sessionLoading) {
        return <div>Loading...</div>;
    }

    return (
        <authContext.Provider
            value={{ userSession, setUserSession, sessionLoading }}
        >
            {children}
        </authContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
