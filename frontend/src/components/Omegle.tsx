import { useEffect, type ChangeEvent } from "react";
import { useUserData } from "../hooks/useUserData";
import { useWebRTC } from "../hooks/useWebRTC";
import { VideoDisplay } from "./communication/VideoDisplay";
import { Controls } from "./communication/Controls";
import { SidePanel } from "./communication/SidePanel";

export const Omegle = () => {
    const { userData, userDataRef, setUserData } = useUserData();
    const {
        videoStates,
        setVideoStates,
        register,
        stopCalls,
        nextCall,
        localStream,
        remoteStream,
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
        <div className="h-screen flex">
            {/* Video & Controls */}
            <div className="flex flex-col m-8 w-2/3">
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

            <SidePanel userData={userData} onDataChange={dataOnChange} />
        </div>
    );
};
