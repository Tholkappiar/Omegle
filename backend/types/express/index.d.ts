import "express";

declare module "express-serve-static-core" {
    interface Request {
        context?: {
            session?: {
                session: {
                    expiresAt: string;
                    token: string;
                    createdAt: string;
                    updatedAt: string;
                    ipAddress: string;
                    userAgent: string;
                    userId: string;
                    id: string;
                };
                user: {
                    id: string;
                    name: string;
                    email: string;
                    emailVerified: boolean;
                    image: string | null;
                    createdAt: string;
                    updatedAt: string;
                };
            };
        };
    }
}
