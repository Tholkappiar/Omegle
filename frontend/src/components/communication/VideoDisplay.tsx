import { Wifi, WifiOff } from "lucide-react";
import type { VideoStateStatus } from "./types";

type VideoDisplayProps = {
    localStreamRef: React.RefObject<HTMLVideoElement | null>;
    remoteStreamRef: React.RefObject<HTMLVideoElement | null>;
    videoStates: VideoStateStatus;
};

export const VideoDisplay = ({
    localStreamRef,
    remoteStreamRef,
    videoStates,
}: VideoDisplayProps) => {
    return (
        <div className="relative flex h-[700px] items-center justify-center">
            {/* Remote Video */}
            <div
                className={`relative w-full h-full rounded-xl ${
                    videoStates.connection !== "successful" ? "bg-gray-600" : ""
                }`}
            >
                <div className="absolute bottom-2 left-2 flex items-center gap-4">
                    <p className="bg-gray-500 text-white text-xs font-light rounded-2xl py-1 px-2 z-10">
                        Partner
                    </p>
                </div>

                <video
                    autoPlay
                    playsInline
                    ref={remoteStreamRef}
                    onContextMenu={(e) => e.preventDefault()}
                    controls={false}
                    className="w-full h-full object-cover border border-purple-300 rounded-xl scale-x-[-1]"
                ></video>

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute bottom-2 right-2 w-1/4 z-10">
                    <div className="relative">
                        <video
                            autoPlay
                            playsInline
                            muted
                            ref={localStreamRef}
                            onContextMenu={(e) => e.preventDefault()}
                            controls={false}
                            className="w-full h-52 object-cover border border-purple-300 rounded-xl scale-x-[-1]"
                        ></video>
                        <p className="absolute bottom-2 left-2 bg-gray-500 text-white text-xs font-light rounded-2xl py-1 px-2">
                            You
                        </p>
                    </div>
                </div>
            </div>

            {/* Connection Status */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                {videoStates.connection === "pending" && (
                    <div className="flex flex-col items-center text-white gap-2 font-light">
                        <Wifi className="w-5 h-5" />
                        <p>Waiting for the Partner ...</p>
                    </div>
                )}
                {videoStates.connection === "left" && (
                    <div className="flex flex-col items-center text-white gap-2 font-light">
                        <WifiOff className="w-5 h-5" />
                        <p>
                            Partner left from the chat, Waiting for the Partner
                            ...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
