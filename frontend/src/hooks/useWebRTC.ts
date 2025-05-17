import { useRef, useState } from "react";
import type {
    RequestData,
    VideoStateStatus,
} from "../components/communication/types";

export const useWebRTC = (userDataRef: React.RefObject<RequestData>) => {
    const ws = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localMediaStream = useRef<MediaStream | null>(null);
    const localStream = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef<HTMLVideoElement | null>(null);

    const [videoStates, setVideoStates] = useState<VideoStateStatus>({
        call: false,
        connection: "pending",
    });

    // To just end the present call
    const endCall = () => {
        if (ws.current) {
            // Send leave message to server
            const data = {
                user: userDataRef.current.user,
                partner: userDataRef.current.partner,
                type: "leave",
            };
            ws.current.send(JSON.stringify(data));
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
        });
    };

    // close everything
    const stopCalls = () => {
        endCall();
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
    };

    const nextCall = () => {
        endCall();
        if (ws.current) {
            // Send next message to server
            const data = {
                user: userDataRef.current.user,
                type: "next",
            };
            ws.current.send(JSON.stringify(data));
        }
    };

    const initWebRTC = async (): Promise<RTCPeerConnection> => {
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
            throw error;
        }
    };

    const handleMessages = async (event: MessageEvent) => {
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

                    setVideoStates({
                        call: true,
                        connection: "successful",
                    });
                } catch (error) {
                    console.error("Failed to initialize WebRTC:", error);
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
    };

    const register = async () => {
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
    };

    return {
        videoStates,
        setVideoStates,
        register,
        endCall,
        stopCalls,
        nextCall,
        localStream,
        remoteStream,
        ws,
    };
};
