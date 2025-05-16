import { Router } from "express";
import { WebSocketManager } from "../../websocket/websockerManager";

const router = Router();
const wsManager = WebSocketManager.getInstance();

router.get("/clients", (req, res) => {
    const clients = wsManager.getConnectedClients();
    res.status(200).json({
        count: clients.length,
        clients,
    });
});

router.get("/pairings", (req, res) => {
    const pairings = wsManager.getPairings();
    res.status(200).json({
        count: Object.keys(pairings).length / 2,
        pairings,
    });
});

router.post("/clear", (req, res) => {
    wsManager.clearAllClients();
    res.status(200).json({
        message: "All clients and pairings cleared",
    });
});

export default router;
