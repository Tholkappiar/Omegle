import { useState, useRef, useEffect } from "react";
import type { RequestData } from "../components/communication/types";
import { authClient } from "../../lib/auth-client";

export const useUserData = () => {
    const [userData, setUserData] = useState<RequestData>({
        user: "",
        partner: "",
        type: "",
        sdp: null,
        candidate: null,
    });

    const userDataRef = useRef<RequestData>({
        user: "",
        partner: "",
        type: "",
        sdp: null,
        candidate: null,
    });

    const updatePartner = (partner: string) => {
        setUserData((prev) => ({
            ...prev,
            partner: partner,
        }));
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const sessionRes = await authClient.getSession();
                console.log(sessionRes);
                const sessionId = sessionRes.data?.user.id || null;
                if (!sessionId) {
                    console.error("session id not found");
                    return;
                }
                setUserData((prev) => ({
                    ...prev,
                    user: sessionId,
                }));
                userDataRef.current.user = sessionId;
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
        updatePartner,
    };
};
