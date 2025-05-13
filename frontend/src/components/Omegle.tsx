import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { authClient } from "../../lib/auth-client";

type RequestData = {
    user: string;
    client?: string;
    type: string;
    sdp?: RTCSessionDescriptionInit | null;
    candidate?: RTCIceCandidateInit | null;
};

const Omegle = () => {
    const [userData, setUserData] = useState<RequestData>({
        user: "",
        client: "",
        type: "",
        sdp: null,
        candidate: null,
    });

    const userDataRef = useRef<RequestData>({
        user: "",
        client: "",
        type: "",
        sdp: null,
        candidate: null,
    });

    const ws = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const localStream = useRef<HTMLVideoElement | null>(null);
    const remoteStream = useRef<HTMLVideoElement | null>(null);

    function dataOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setUserData((prev) => {
            const updated = { ...prev, [name]: value };
            userDataRef.current = updated;
            return updated;
        });
    }

    async function register() {
        try {
            const websocket_url = import.meta.env.VITE_WEBSOCKET;
            const websocketConnection = new WebSocket(websocket_url);
            ws.current = websocketConnection;
            websocketConnection.onmessage = handleMessages;
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
                    client: userDataRef.current.client,
                    type: "candidate",
                    candidate: event.candidate,
                };
                ws.current?.send(JSON.stringify(data));
            }
        };

        pc.ontrack = (event) => {
            if (event.streams.length > 0 && remoteStream.current) {
                remoteStream.current.srcObject = event.streams[0];
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        if (localStream.current) {
            localStream.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        return pc;
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
                    client: parsed.user,
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
                userDataRef.current.client = parsed.partner;
                const isOfferer = userDataRef.current.user < parsed.partner;
                const newPc = await initWebRTC();

                if (isOfferer) {
                    const offer = await newPc.createOffer();
                    await newPc.setLocalDescription(offer);

                    const data: RequestData = {
                        user: userDataRef.current.user,
                        client: parsed.partner,
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
    }, []);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="flex gap-4">
                <div>
                    <p className="font-bold my-4">Your Video :</p>
                    <video
                        autoPlay
                        playsInline
                        muted
                        ref={localStream}
                        className="border border-black w-96 h-72"
                    ></video>
                </div>
                <div>
                    <p className="font-bold my-4">Client Video :</p>
                    <video
                        autoPlay
                        playsInline
                        ref={remoteStream}
                        className="border border-black w-96 h-72"
                    ></video>
                </div>
            </div>

            <div className="flex flex-col gap-4 my-4 w-1/2">
                <input
                    className="p-2 border border-black rounded-xl"
                    placeholder="Getting your Name ..."
                    disabled
                    name="user"
                    value={userData.user}
                    onChange={dataOnChange}
                    type="text"
                />
            </div>
            <div className="flex flex-col gap-2">
                <button
                    onClick={register}
                    className="p-2 rounded-xl bg-green-500 text-white font-semibold"
                >
                    Register and Start Call
                </button>
            </div>
        </div>
    );
};

export default Omegle;
