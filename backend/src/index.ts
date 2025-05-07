import express from "express";
import { createServer } from "http";
import { WebsocketManager } from "./websocket/websockerManager";

const app = express();

const server = createServer(app);

const wm = WebsocketManager.getInstance(server);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello, World !",
    });
});

app.get("/get-all-clients", (req, res) => {
    const clients: string[] = [];
    wm.clients.forEach((value, key) => {
        clients.push(key);
    });
    res.status(200).json(clients);
});

app.get("/clear-all-clients", (req, res) => {
    wm.clients = new Map();
    res.status(200).json({
        message: "removed users",
    });
});

server.listen(3000, () => console.log("Server started on PORT 3000"));
