import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { openAPI } from "better-auth/plugins";
import { CONFIG } from "./config";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { enabled: true },
    trustedOrigins: [CONFIG.FRONTEND_URL],
    plugins: [openAPI()],
});
