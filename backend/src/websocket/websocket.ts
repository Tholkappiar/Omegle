import { Express } from "express";
import apiRoutes from "../controllers/apiRoutes";
import websocketRoutes from "../controllers/clientRoutes/clientHandler";

export function registerRoutes(app: Express): void {
    app.use("/api", apiRoutes);
    app.use("/api/websocket", websocketRoutes);
}
