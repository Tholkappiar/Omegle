import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import type {
    childrenProp,
    UserSession,
} from "../components/communication/types";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/utils";

type AuthContextType = {
    userSession: UserSession | null;
    sessionLoading: boolean;
    setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
    refetchSession: () => Promise<void>;
};

const authContext = createContext<AuthContextType>({
    userSession: null,
    setUserSession: () => {},
    sessionLoading: false,
    refetchSession: async () => {},
});

export const AuthProvider = ({ children }: childrenProp) => {
    const [userSession, setUserSession] = useState<UserSession | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    const { useSession } = authClient;
    const navigate = useNavigate();
    const { data, isPending, error, refetch } = useSession();
    const hasInitialized = useRef(false);

    const refetchSession = useCallback(async () => {
        try {
            setSessionLoading(true);
            refetch();
        } catch (err) {
            console.error("Error refetching session:", err);
            setUserSession(null);
            showToast("Failed to refresh session");
        } finally {
            setSessionLoading(false);
        }
    }, [refetch]);

    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current && !isPending && !error && !data?.session) {
            console.log("Skipping re-initialization - already checked session");
            return;
        }

        setSessionLoading(isPending);

        if (isPending) {
            return;
        }

        if (error) {
            setUserSession(null);
            setSessionLoading(false);
            hasInitialized.current = true;
            return;
        }

        if (data?.session) {
            const expiresAt = new Date(data.session.expiresAt).getTime();
            const currentTime = Date.now();
            const delay = expiresAt - currentTime;

            if (delay <= 0) {
                console.log("Session expired. Clearing session...");
                setUserSession(null);
                setSessionLoading(false);
                hasInitialized.current = true;
                return;
            }

            setUserSession(data);
            setSessionLoading(false);
            hasInitialized.current = true;

            const timeout = setTimeout(() => {
                console.log("Session expired. Auto-logout triggered.");
                showToast("Session Expired, Please Login again !");
                setUserSession(null);
                navigate("/");
            }, delay);

            return () => clearTimeout(timeout);
        } else {
            setUserSession(null);
            setSessionLoading(false);
            hasInitialized.current = true;
        }
    }, [data, error, isPending, navigate]);

    if (sessionLoading && !hasInitialized.current) {
        return <div>Loading...</div>;
    }

    return (
        <authContext.Provider
            value={{
                userSession,
                sessionLoading,
                setUserSession,
                refetchSession,
            }}
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
