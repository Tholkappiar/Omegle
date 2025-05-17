export type RequestData = {
    user: string;
    partner?: string;
    type: string;
    sdp?: RTCSessionDescriptionInit | null;
    candidate?: RTCIceCandidateInit | null;
};

export type VideoStateStatus = {
    call: boolean;
    connection?: "successful" | "pending" | "left";
};
