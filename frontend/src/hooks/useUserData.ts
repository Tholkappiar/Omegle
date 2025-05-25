import { useState, useRef, useEffect } from "react";
import type { RequestData } from "../components/communication/types";
import { useAuth } from "../context/AuthContext";

export const useUserData = () => {
    const [userData, setUserData] = useState<RequestData>({
        user: "",
        partner: "",
        sdp: null,
        candidate: null,
    });

    const userDataRef = useRef<RequestData>({
        user: "",
        partner: "",
        sdp: null,
        candidate: null,
    });

    const { userSession } = useAuth();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const userID = userSession?.user.id || null;
                if (!userID) {
                    console.error("session id not found");
                    return;
                }
                setUserData((prev) => ({
                    ...prev,
                    user: userID,
                }));
                userDataRef.current.user = userID;
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };

        fetchSession();
    }, []);

    return {
        userData,
        setUserData,
        userDataRef,
        userSession,
    };
};
