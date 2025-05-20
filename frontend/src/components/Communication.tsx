import { useEffect, type ChangeEvent } from "react";
import { useUserData } from "../hooks/useUserData";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoDisplay } from "./communication/VideoDisplay";
import { Controls } from "./communication/Controls";
import { ChatSection } from "./communication/Chat";

export const Communication = () => {
    const { userDataRef, setUserData } = useUserData();
    const {
        videoStates,
        setVideoStates,
        register,
        stopCalls,
        nextCall,
        localStream,
        remoteStream,
        ws,
    } = useWebRTC(userDataRef);

    function dataOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setUserData((prev) => {
            const updated = { ...prev, [name]: value };
            userDataRef.current = updated;
            return updated;
        });
    }

    const handleEndCall = () => {
        if (videoStates.call) {
            stopCalls();
        }
    };

    useEffect(() => {
        register();
        setVideoStates((prev) => ({
            ...prev,
            call: true,
        }));
        // Cleanup function
        return () => {
            stopCalls();
        };
    }, []);

    return (
        <div className="flex-1 flex p-10 bg-gradient-to-br from-purple-100 to-blue-100">
            {/* Video & Controls */}
            <div className="flex flex-col mx-8 w-2/3 ">
                <VideoDisplay
                    localStreamRef={localStream}
                    remoteStreamRef={remoteStream}
                    videoStates={videoStates}
                />
                <Controls
                    isCallActive={videoStates.call}
                    onEndCall={handleEndCall}
                    onNextCall={nextCall}
                />
            </div>

            <ChatSection
                userData={userDataRef.current}
                onDataChange={dataOnChange}
                ws={ws}
            />
        </div>
    );
};
