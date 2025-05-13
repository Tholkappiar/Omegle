import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello, World !",
        version: "1.0.0",
    });
});

export default router;
