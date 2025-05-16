import { Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WebSocketMessage } from "./types";
import { normalizeHeaders } from "../utils/utils";
import { auth } from "../utils/auth";

export class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private wss: WebSocketServer | null = null;

    private users: Map<string, WebSocket> = new Map();
    private availableUsers: Set<string> = new Set();
    private pairings: Map<string, string> = new Map();
    private mediaStates: Map<string, { microphone: boolean; video: boolean }> =
        new Map();

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
            case "media-state-change":
                this.handleMediaStateChange(message);
                break;
            case "leave":
                this.handleLeave(message.user);
                break;
            default:
                console.warn(`Unknown message type: ${(message as any).type}`);
        }
    }

    private handleRegister(userId: string, ws: WebSocket): void {
        console.log(`Registering user: ${userId}`);
        this.users.set(userId, ws);

        // Initialize media state for new user
        this.mediaStates.set(userId, { microphone: true, video: true });

        // Pair the user with someone available
        this.pairUser(userId);
    }

    private handleMediaStateChange(message: WebSocketMessage): void {
        const { user, partner, mediaState } = message;

        // Update stored media state
        if (user && mediaState) {
            const currentState = this.mediaStates.get(user) || {
                microphone: true,
                video: true,
            };
            this.mediaStates.set(user, {
                ...currentState,
                ...mediaState,
            });
        }

        // Relay the media state change to partner
        this.relayMessage(message);
    }

    private handleLeave(userId: string): void {
        const partner = this.pairings.get(userId);

        if (partner) {
            this.pairings.delete(userId);
            this.pairings.delete(partner);

            // Send leave notification to partner
            this.users.get(partner)?.send(
                JSON.stringify({
                    type: "leave",
                    user: userId,
                    partner: partner,
                })
            );

            // Add partner back to available users
            this.availableUsers.add(partner);
        }

        // Remove media state
        this.mediaStates.delete(userId);
    }

    private relayMessage(message: WebSocketMessage): void {
        const targetClient = message.partner;
        if (targetClient && this.users.has(targetClient)) {
            this.users.get(targetClient)?.send(JSON.stringify(message));
        }
    }

    private pairUser(userId: string): void {
        // Don't pair users who are already paired
        if (this.pairings.has(userId)) {
            return;
        }

        for (const partner of this.availableUsers) {
            if (partner !== userId) {
                this.availableUsers.delete(partner);

                this.pairings.set(userId, partner);
                this.pairings.set(partner, userId);

                this.notifyMatch(userId, partner);
                return;
            }
        }

        // No match found, add to available users
        this.availableUsers.add(userId);
    }

    private notifyMatch(user1: string, user2: string): void {
        // Send match notification with initial media states
        const user1MediaState = this.mediaStates.get(user1);
        const user2MediaState = this.mediaStates.get(user2);

        this.users.get(user1)?.send(
            JSON.stringify({
                type: "match",
                partner: user2,
                partnerMediaState: user2MediaState,
            })
        );

        this.users.get(user2)?.send(
            JSON.stringify({
                type: "match",
                partner: user1,
                partnerMediaState: user1MediaState,
            })
        );
    }

    private handleNext(userId: string): void {
        const partner = this.pairings.get(userId);

        if (partner) {
            this.pairings.delete(userId);
            this.pairings.delete(partner);

            this.users.get(partner)?.send(
                JSON.stringify({
                    type: "leave",
                    user: userId,
                    partner: partner,
                })
            );

            // Make partner available again
            this.availableUsers.add(partner);
        }

        // Find new partner for the user
        this.pairUser(userId);
    }

    private handleDisconnect(ws: WebSocket): void {
        let disconnectedUserId: string | undefined;

        for (const [userId, socket] of this.users.entries()) {
            if (socket === ws) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            this.users.delete(disconnectedUserId);
            this.availableUsers.delete(disconnectedUserId);
            this.mediaStates.delete(disconnectedUserId);

            const partner = this.pairings.get(disconnectedUserId);
            if (partner) {
                this.pairings.delete(disconnectedUserId);
                this.pairings.delete(partner);

                this.users.get(partner)?.send(
                    JSON.stringify({
                        type: "leave",
                        user: disconnectedUserId,
                        partner: partner,
                    })
                );

                // Make partner available again
                this.availableUsers.add(partner);
            }
        }
    }

    public getConnectedClients(): string[] {
        return Array.from(this.users.keys());
    }

    public getPairings(): Record<string, string> {
        return Object.fromEntries(this.pairings.entries());
    }

    public getMediaStates(): Record<
        string,
        { microphone: boolean; video: boolean }
    > {
        return Object.fromEntries(this.mediaStates.entries());
    }

    public clearAllClients(): void {
        this.users.clear();
        this.availableUsers.clear();
        this.pairings.clear();
        this.mediaStates.clear();
    }
}
