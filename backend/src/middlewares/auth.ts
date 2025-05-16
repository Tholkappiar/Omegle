import { NextFunction, Request, Response } from "express";
import { auth } from "../utils/auth";
import { normalizeHeaders } from "../utils/utils";

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const headers = normalizeHeaders(req);
    const session = await auth.api.getSession({
        headers,
    });

    if (!session) {
        res.status(403).send({
            error: "No valid session found",
            message: "Unauthorized",
            success: false,
        });
        req.context = {};
        return;
    }

    const user = serializeSession(session);
    req.context = {
        session: user,
    };
    next();
}

function serializeSession(session: any) {
    return {
        session: {
            ...session.session,
            createdAt: new Date(session.session.createdAt).toISOString(),
            updatedAt: new Date(session.session.updatedAt).toISOString(),
            expiresAt: new Date(session.session.expiresAt).toISOString(),
            ipAddress: session.session.ipAddress ?? "",
            userAgent: session.session.userAgent ?? "",
        },
        user: {
            ...session.user,
            createdAt: new Date(session.user.createdAt).toISOString(),
            updatedAt: new Date(session.user.updatedAt).toISOString(),
            image: session.user.image ?? null,
        },
    };
}
