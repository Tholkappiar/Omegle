import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

type RequestData = {
    user: string;
    client: string;
    type: "register" | "offer" | "answer" | "candidate";
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
};

export class WebsocketManager {
    static instance: WebsocketManager;
    websocketServer: WebSocketServer;
    clients: Map<string, WebSocket>;

    private constructor(server: Server) {
        this.websocketServer = new WebSocketServer({ server });
        this.clients = new Map();
        this.handleMessages();
    }

    static getInstance(server: Server) {
        if (!this.instance) this.instance = new WebsocketManager(server);
        return this.instance;
    }

    private handleMessages() {
        this.websocketServer.on("connection", (ws) => {
            ws.on("message", (data) => {
                try {
                    const parsed: RequestData = JSON.parse(String(data));
                    const type = parsed.type;
                    switch (type) {
                        case "register":
                            this.clients.set(parsed.user, ws);
                            break;
                        case "offer":
                        case "answer":
                        case "candidate":
                            this.clients
                                .get(parsed.client)
                                ?.send(JSON.stringify(parsed));
                            break;
                    }
                } catch (err) {
                    console.error(err);
                    return;
                }
            });

            ws.on("close", () => {
                ws.send(
                    JSON.stringify({
                        message: "websocket connection closed",
                    })
                );
            });
        });
    }
}
