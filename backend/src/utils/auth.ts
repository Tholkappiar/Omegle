import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { multiSession, openAPI } from "better-auth/plugins";
import { CONFIG } from "./config";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [CONFIG.FRONTEND_URL],
    plugins: [
        openAPI(),
        multiSession({
            maximumSessions: 0,
        }),
    ],
    emailAndPassword: { enabled: true, requireEmailVerification: true },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log(url);
            // await sendEmail({
            //     to: user.email,
            //     subject: 'Verify your email address',
            //     text: `Click the link to verify your email: ${url}`
            // })
        },
    },
    session: {
        expiresIn: 60 * 2, // 120 sec for test
    },
});
