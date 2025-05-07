import { useRef, useState, type ChangeEvent } from "react";

type RequestData = {
    user: string;
    client: string;
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
        const websocketConnection = new WebSocket(
            "wss://omegle-ue63.onrender.com"
        );
        ws.current = websocketConnection;
        websocketConnection.onopen = () => {
            const data: RequestData = {
                user: userData.user,
                client: userData.client,
                type: "register",
            };
            websocketConnection.send(JSON.stringify(data));
        };
        await initWebRTC();
        websocketConnection.onmessage = handleMessages;
    }

    async function initWebRTC() {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
            const c = event.candidate;
            ws.current?.send(
                JSON.stringify({
                    user: userDataRef.current.user,
                    client: userDataRef.current.client,
                    type: "candidate",
                    candidate: c,
                })
            );
        };

        pc.ontrack = (event) => {
            if (event.streams && remoteStream.current) {
                remoteStream.current.srcObject = event.streams[0];
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        if (localStream.current) localStream.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });
    }

    async function handleMessages(event: MessageEvent) {
        const parsed = JSON.parse(event.data);
        switch (parsed.type) {
            case "offer": {
                await pcRef.current?.setRemoteDescription(
                    new RTCSessionDescription(parsed.sdp)
                );
                const answer = await pcRef.current?.createAnswer();
                await pcRef.current?.setLocalDescription(answer);
                const data: RequestData = {
                    user: userDataRef.current.user,
                    client: parsed.user,
                    type: "answer",
                    sdp: answer,
                };
                ws.current?.send(JSON.stringify(data));
                break;
            }
            case "answer":
                await pcRef.current?.setRemoteDescription(
                    new RTCSessionDescription(parsed.sdp)
                );
                break;
            case "candidate":
                pcRef.current?.addIceCandidate(parsed.candidate);
                break;
        }
    }

    async function startCall() {
        const offer = await pcRef.current?.createOffer();
        pcRef.current?.setLocalDescription(offer);
        const data: RequestData = {
            user: userData.user,
            client: userData.client,
            type: "offer",
            sdp: offer,
        };
        ws.current?.send(JSON.stringify(data));
    }

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
                    <p className="font-bold m my-4">Client Video :</p>
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
                    placeholder="Your Name"
                    name="user"
                    value={userData.user}
                    onChange={dataOnChange}
                    type="text"
                />
                <input
                    className="p-2 border border-black rounded-xl"
                    placeholder="Client Name"
                    name="client"
                    value={userData.client}
                    onChange={dataOnChange}
                    type="text"
                />
            </div>
            <div className="flex flex-col gap-2">
                <button
                    onClick={register}
                    className="p-2 rounded-xl bg-blue-500 text-white font-semibold"
                >
                    Register
                </button>
                <button
                    onClick={startCall}
                    className="p-2 rounded-xl bg-green-500 text-white font-semibold"
                >
                    Start Call
                </button>
            </div>
        </div>
    );
};

export default Omegle;
