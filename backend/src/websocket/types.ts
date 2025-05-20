import { WebSocket } from "ws";

export type WebSocketClient = {
    userId: string;
    socket: WebSocket;
};

export type WebSocketMessage = {
    user: string;
    partner?: string;
    type: "offer" | "answer" | "candidate" | "next" | "chat" | "leave";
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
    mediaState: Map<string, { microphone: boolean; video: boolean }>;
};
