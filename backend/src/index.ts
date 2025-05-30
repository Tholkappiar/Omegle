import express from "express";
import { createServer } from "http";
import { WebSocketManager } from "./websocket/websockerManager";
import { registerRoutes } from "./websocket/websocket";
import { CONFIG } from "./utils/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

app.use(
    cors({
        origin: CONFIG.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

WebSocketManager.getInstance().initialize(httpServer);

// Register all routes
registerRoutes(app);

// Start server
httpServer.listen(CONFIG.PORT, () => {
    console.log(`🚀 Server is running on port ${CONFIG.PORT}`);
    console.log(`Environment: ${CONFIG.ENVIRONMENT}`);
});
