import type { ReactNode } from "react";

export type RequestType =
    | "offer"
    | "answer"
    | "candidate"
    | "leave"
    | "chat"
    | "next";
export type ConnectionStatus = "successful" | "pending" | "left";

export type RequestData = {
    user: string;
    partner?: string;
    type?: RequestType;
    sdp?: RTCSessionDescriptionInit | null;
    candidate?: RTCIceCandidateInit | null;
    message?: string;
};

export type VideoStateStatus = {
    call: boolean;
    connection?: ConnectionStatus;
};

export type userAuthRequest = {
    name?: string;
    email: string;
    password: string;
};

export interface childrenProp {
    children: ReactNode;
}

interface session {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}

interface user {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
}

export interface UserSession {
    user: user;
    session?: session;
}
