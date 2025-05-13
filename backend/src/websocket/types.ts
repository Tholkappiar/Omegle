import { WebSocket } from "ws";

export type WebSocketClient = {
    userId: string;
    socket: WebSocket;
};

export type WebSocketMessage = {
    user: string;
    client?: string;
    type: "offer" | "answer" | "candidate" | "next";
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
};
