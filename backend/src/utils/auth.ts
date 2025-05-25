import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../generated/prisma/client";
import { openAPI } from "better-auth/plugins";
import { CONFIG } from "./config";
import { emailOTP } from "better-auth/plugins";
import { transporter } from "./Mailer";
import { otpEmailTemplate, verificationEmailTemplate } from "./EmailTemplate";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    appName: "omegle-mny-app",
    trustedOrigins: [CONFIG.FRONTEND_URL],
    plugins: [
        openAPI(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                try {
                    await transporter.sendMail({
                        from: '"Omegle MNY App" <trickytom097@gmail.com>',
                        to: email,
                        subject: "Your Verification OTP",
                        html: otpEmailTemplate(otp),
                    });
                    console.log(`OTP sent to ${email}`);
                } catch (error) {
                    console.error("Error sending OTP email:", error);
                    throw new Error("Failed to send OTP email");
                }
            },
            expiresIn: 60,
        }),
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const URL = `${CONFIG.FRONTEND_URL}/verify-email?token=${token}&email=${user.email}`;
                console.log(URL);
                await transporter.sendMail({
                    from: '"Omegle MNY App" <trickytom097@gmail.com>',
                    to: user.email,
                    subject: "Verify Your Email Address",
                    html: verificationEmailTemplate(URL),
                });
            } catch (error) {
                console.error("Error sending verification email:", error);
                throw new Error("Failed to send verification email");
            }
        },
        expiresIn: 3600,
        autoSignInAfterVerification: true,
    },
    session: {
        expiresIn: 60 * 2, // 120 sec for test
    },
});
