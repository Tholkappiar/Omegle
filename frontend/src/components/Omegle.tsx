import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { authClient } from "../../lib/auth-client";
import {
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Video,
    VideoOff,
    Wifi,
    WifiOff,
} from "lucide-react";

type RequestData = {
    user: string;
    partner?: string;
    type: string;
    sdp?: RTCSessionDescriptionInit | null;
    candidate?: RTCIceCandidateInit | null;
};

type videoStateStatus = {
    microphone: boolean;
    video: boolean;
    call: boolean;
    connection?: "successful" | "pending" | "left";
    partnerVideo?: boolean;
    partnerAudio?: boolean;
};

const Omegle = () => {
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

    const ws = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localMediaStream = useRef<MediaStream | null>(null);

    const localStream = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef<HTMLVideoElement | null>(null);

    const [videoStates, setVideoStates] = useState<videoStateStatus>({
        call: false,
        connection: "pending",
        microphone: true,
        video: true,
        partnerVideo: true,
        partnerAudio: true,
    });

    function dataOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setUserData((prev) => {
            const updated = { ...prev, [name]: value };
            userDataRef.current = updated;
            return updated;
        });
    }

    const toggleMicrophone = () => {
        if (!localMediaStream.current) return;

        localMediaStream.current.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });

        setVideoStates((prev) => ({
            ...prev,
            microphone: !prev.microphone,
        }));

        // Notify partner about microphone state change
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const data = {
                user: userDataRef.current.user,
                partner: userDataRef.current.partner,
                type: "media-state-change",
                mediaState: {
                    microphone: !videoStates.microphone,
                },
            };
            ws.current.send(JSON.stringify(data));
        }
    };

    const toggleVideo = () => {
        if (!localMediaStream.current) return;

        localMediaStream.current.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });

        setVideoStates((prev) => ({
            ...prev,
            video: !prev.video,
        }));

        // Notify partner about video state change
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const data = {
                user: userDataRef.current.user,
                partner: userDataRef.current.partner,
                type: "media-state-change",
                mediaState: {
                    video: !videoStates.video,
                },
            };
            ws.current.send(JSON.stringify(data));
        }
    };

    const handleCallButton = () => {
        if (videoStates.call) {
            endCall();
        } else {
            register();
            setVideoStates((prev) => ({
                ...prev,
                call: true,
            }));
        }
    };

    const endCall = () => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        if (ws.current) {
            // Send leave message to server
            const data = {
                user: userDataRef.current.user,
                partner: userDataRef.current.partner,
                type: "leave",
            };
            ws.current.send(JSON.stringify(data));
            ws.current.close();
            ws.current = null;
        }

        // Stop local media stream
        if (localMediaStream.current) {
            localMediaStream.current
                .getTracks()
                .forEach((track) => track.stop());
            localMediaStream.current = null;
        }

        // Reset video elements
        if (localStream.current) {
            localStream.current.srcObject = null;
        }

        if (remoteStream.current) {
            remoteStream.current.srcObject = null;
        }

        setVideoStates({
            call: false,
            connection: "pending",
            microphone: true,
            video: true,
            partnerVideo: true,
        });
    };

    async function register() {
        try {
            const websocket_url = import.meta.env.VITE_WEBSOCKET;
            const websocketConnection = new WebSocket(websocket_url);
            ws.current = websocketConnection;
            websocketConnection.onmessage = handleMessages;

            // Add onclose event handler for WebSocket
            websocketConnection.onclose = () => {
                console.log("WebSocket connection closed");
                setVideoStates((prev) => ({
                    ...prev,
                    connection: "left",
                }));
            };

            websocketConnection.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (err) {
            console.error("err : ", err);
        }
    }

    async function initWebRTC(): Promise<RTCPeerConnection> {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:5349" },
            ],
        });
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const data = {
                    user: userDataRef.current.user,
                    partner: userDataRef.current.partner,
                    type: "candidate",
                    candidate: event.candidate,
                };
                ws.current?.send(JSON.stringify(data));
                setVideoStates((prev) => ({
                    ...prev,
                    connection: "successful",
                }));
            }
        };

        pc.ontrack = (event) => {
            if (event.streams.length > 0 && remoteStream.current) {
                remoteStream.current.srcObject = event.streams[0];
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (
                pc.iceConnectionState === "disconnected" ||
                pc.iceConnectionState === "failed" ||
                pc.iceConnectionState === "closed"
            ) {
                setVideoStates((prev) => ({
                    ...prev,
                    connection: "left",
                }));
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });

            localMediaStream.current = stream;

            if (localStream.current) {
                localStream.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            return pc;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            // Set default values if media access fails
            setVideoStates((prev) => ({
                ...prev,
                microphone: false,
                video: false,
            }));

            throw error;
        }
    }

    async function handleMessages(event: MessageEvent) {
        const parsed = JSON.parse(event.data);
        const pc = pcRef.current;

        switch (parsed.type) {
            case "offer": {
                if (!pc) return;

                await pc.setRemoteDescription(
                    new RTCSessionDescription(parsed.sdp)
                );

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                const data: RequestData = {
                    user: userDataRef.current.user,
                    partner: parsed.user,
                    type: "answer",
                    sdp: answer,
                };
                ws.current?.send(JSON.stringify(data));
                break;
            }
            case "answer": {
                if (!pc) return;

                if (pc.signalingState !== "have-local-offer") {
                    console.warn(
                        "Cannot set remote answer: current signalingState is",
                        pc.signalingState
                    );
                    return;
                }
                await pcRef.current?.setRemoteDescription(
                    new RTCSessionDescription(parsed.sdp)
                );
                break;
            }

            case "candidate": {
                if (!pc) return;

                if (parsed.candidate) {
                    try {
                        await pc.addIceCandidate(parsed.candidate);
                    } catch (err) {
                        console.warn("Failed to add candidate:", err);
                    }
                }
                break;
            }

            case "match": {
                userDataRef.current.partner = parsed.partner;
                setUserData((prev) => ({
                    ...prev,
                    partner: parsed.partner,
                }));

                const isOfferer = userDataRef.current.user < parsed.partner;
                try {
                    const newPc = await initWebRTC();

                    if (isOfferer) {
                        const offer = await newPc.createOffer();
                        await newPc.setLocalDescription(offer);

                        const data: RequestData = {
                            user: userDataRef.current.user,
                            partner: parsed.partner,
                            type: "offer",
                            sdp: offer,
                        };
                        ws.current?.send(JSON.stringify(data));
                    } else {
                        console.log(
                            "Waiting for offer from partner:",
                            parsed.partner
                        );
                    }
                } catch (error) {
                    console.error("Failed to initialize WebRTC:", error);
                }

                break;
            }

            case "media-state-change": {
                if (parsed.mediaState) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            parsed.mediaState,
                            "video"
                        )
                    ) {
                        setVideoStates((prev) => ({
                            ...prev,
                            partnerVideo: parsed.mediaState.video,
                        }));
                    } else if (
                        Object.prototype.hasOwnProperty.call(
                            parsed.mediaState,
                            "microphone"
                        )
                    ) {
                        setVideoStates((prev) => ({
                            ...prev,
                            partnerAudio: parsed.mediaState.microphone,
                        }));
                    }
                }
                break;
            }

            case "leave": {
                setVideoStates((prev) => ({
                    ...prev,
                    connection: "left",
                }));
                break;
            }
        }
    }

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

        // Cleanup function
        return () => {
            // Stop all media tracks
            if (localMediaStream.current) {
                localMediaStream.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }

            // Close peer connection
            if (pcRef.current) {
                pcRef.current.close();
            }

            // Close WebSocket connection
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, []);

    return (
        <div className="h-screen flex">
            {/* Video & Controls */}
            <div className="flex flex-col m-8 w-2/3">
                {/* Video Area */}
                <div className="relative flex h-[700px] items-center justify-center">
                    {/* Remote Video */}
                    <div className="relative w-full h-full">
                        <div className="absolute bottom-2 left-2 flex items-center gap-4">
                            <p className="bg-gray-500 text-white text-xs font-light rounded-2xl py-1 px-2 z-10">
                                Partner
                            </p>
                            {!videoStates.partnerAudio && (
                                <MicOff className="w-4 h-4 text-white" />
                            )}
                        </div>

                        <video
                            autoPlay
                            playsInline
                            ref={remoteStream}
                            className={`w-full h-full object-cover border border-pink-300 rounded-xl ${
                                videoStates.connection !== "successful" ||
                                !videoStates.partnerVideo
                                    ? "bg-gray-800"
                                    : ""
                            }`}
                        ></video>

                        {/* Show Video Off indicator when partner's video is off */}
                        {videoStates.connection === "successful" &&
                            !videoStates.partnerVideo && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                                    <div className="flex flex-col items-center text-white gap-2 font-light">
                                        <VideoOff className="w-12 h-12" />
                                        <p>Partner's video is turned off</p>
                                    </div>
                                </div>
                            )}

                        {/* Local Video (Picture-in-Picture) */}
                        <div className="absolute bottom-2 right-2 w-1/4 z-10">
                            <p className="absolute bottom-2 left-2 bg-gray-500 text-white text-xs font-light rounded-2xl py-1 px-2">
                                You
                            </p>
                            <video
                                autoPlay
                                playsInline
                                muted
                                ref={localStream}
                                className={`w-full h-52 object-cover border border-pink-300 rounded-xl ${
                                    !videoStates.video ? "bg-gray-800" : ""
                                }`}
                            ></video>
                            {!videoStates.video && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
                                    <VideoOff className="w-8 h-8" />
                                </div>
                            )}
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
                                    Partner left from the chat, Waiting for the
                                    Partner ...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 px-8 rounded-3xl justify-center py-1 my-4">
                    <button
                        onClick={toggleMicrophone}
                        className={`rounded-full w-12 h-12 flex items-center justify-center border shadow-lg ${
                            videoStates.microphone
                                ? "bg-white text-pink-500"
                                : "bg-red-500 text-white"
                        }`}
                    >
                        {videoStates.microphone ? (
                            <Mic className="w-5 h-5" />
                        ) : (
                            <MicOff className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`rounded-full w-12 h-12 flex items-center justify-center border shadow-lg ${
                            videoStates.video
                                ? "bg-white text-pink-500"
                                : "bg-red-500 text-white"
                        }`}
                    >
                        {videoStates.video ? (
                            <Video className="w-5 h-5" />
                        ) : (
                            <VideoOff className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={handleCallButton}
                        className={`rounded-full w-12 h-12 flex items-center justify-center border shadow-lg ${
                            videoStates.call
                                ? "bg-white text-pink-500"
                                : "bg-red-500 text-white"
                        }`}
                    >
                        {videoStates.call ? (
                            <Phone className="w-5 h-5" />
                        ) : (
                            <PhoneOff className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Side Panel */}
            <div className="w-1/3 flex flex-col items-center justify-center bg-white gap-4">
                <input
                    className="p-2 border border-black rounded-xl"
                    placeholder="Getting your Name ..."
                    disabled
                    name="user"
                    value={userData.user}
                    onChange={dataOnChange}
                    type="text"
                />
                {userData.partner && (
                    <div className="text-sm text-gray-600">
                        Connected with: {userData.partner}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Omegle;
