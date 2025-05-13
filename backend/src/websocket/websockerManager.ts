import { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WebSocketMessage } from "./types";
import { normalizeHeaders } from "../utils/utils";
import { auth } from "../utils/auth";

export class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer | null = null;

    private clients: Map<string, WebSocket> = new Map();
    private availableUsers: Set<string> = new Set();
    private pairings: Map<string, string> = new Map();

    private constructor() {}

    public initialize(server: HttpServer): void {
        if (this.wss) {
            return;
        }

        this.wss = new WebSocketServer({ server });
        this.setupEventHandlers();
    }

    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    private setupEventHandlers(): void {
        if (!this.wss) {
            throw new Error("WebSocketServer not initialized");
        }

        this.wss.on("connection", async (ws: WebSocket, request) => {
            const headers = normalizeHeaders(request);
            const session = await auth.api.getSession({ headers });

            if (!session) {
                ws.close();
                return;
            }

            this.handleRegister(session.user.id, ws);
            this.handleConnection(ws);
        });
    }

    private handleConnection(ws: WebSocket): void {
        ws.on("message", (data: any) => {
            try {
                const message: WebSocketMessage = JSON.parse(data.toString());
                this.handleMessage(message, ws);
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        });

        ws.on("close", () => {
            this.handleDisconnect(ws);
        });
    }

    private handleMessage(message: WebSocketMessage, ws: WebSocket): void {
        switch (message.type) {
            case "offer":
            case "answer":
            case "candidate":
                this.relayMessage(message);
                break;
            case "next":
                this.handleNext(message.user);
                break;
            default:
                console.warn(`Unknown message type: ${(message as any).type}`);
        }
    }

    private handleRegister(userId: string, ws: WebSocket): void {
        console.log(`Registering user: ${userId}`);
        this.clients.set(userId, ws);
        this.pairUser(userId);
    }

    private relayMessage(message: WebSocketMessage): void {
        const targetClient = message.client;
        if (targetClient && this.clients.has(targetClient)) {
            this.clients.get(targetClient)?.send(JSON.stringify(message));
        }
    }

    private pairUser(userId: string): void {
        for (const partner of this.availableUsers) {
            if (partner !== userId) {
                this.availableUsers.delete(userId);
                this.availableUsers.delete(partner);

                this.pairings.set(userId, partner);
                this.pairings.set(partner, userId);

                this.notifyMatch(userId, partner);
                return;
            }
        }

        this.availableUsers.add(userId);
    }

    private notifyMatch(user1: string, user2: string): void {
        this.clients.get(user1)?.send(
            JSON.stringify({
                type: "match",
                partner: user2,
            })
        );

        this.clients.get(user2)?.send(
            JSON.stringify({
                type: "match",
                partner: user1,
            })
        );
    }

    private handleNext(userId: string): void {
        const partner = this.pairings.get(userId);

        if (partner) {
            this.pairings.delete(userId);
            this.pairings.delete(partner);

            this.clients.get(partner)?.send(
                JSON.stringify({
                    type: "partner-left",
                    partner: userId,
                })
            );
        }

        this.pairUser(userId);
    }

    private handleDisconnect(ws: WebSocket): void {
        let disconnectedUserId: string | undefined;

        for (const [userId, socket] of this.clients.entries()) {
            if (socket === ws) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            this.clients.delete(disconnectedUserId);

            this.availableUsers.delete(disconnectedUserId);

            const partner = this.pairings.get(disconnectedUserId);
            if (partner) {
                this.pairings.delete(disconnectedUserId);
                this.pairings.delete(partner);

                this.clients.get(partner)?.send(
                    JSON.stringify({
                        type: "partner-left",
                        partner: disconnectedUserId,
                    })
                );
            }
        }
    }

    public getConnectedClients(): string[] {
        return Array.from(this.clients.keys());
    }

    public getPairings(): Record<string, string> {
        return Object.fromEntries(this.pairings.entries());
    }

    public clearAllClients(): void {
        this.clients.clear();
        this.availableUsers.clear();
        this.pairings.clear();
    }
}
