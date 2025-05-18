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
