import React, { useState, useEffect, useRef } from "react";
import { showToast } from "./utils";
import { authClient } from "../../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface OTPInputProps {
    email: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ email }) => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState<number>(60);
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const { refetchSession } = useAuth();

    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }

        const timeout = setTimeout(() => {
            setTimer(timer - 1);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [timer]);

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (index === 5 && value) {
            verifyOTP(newOtp.join(""));
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const paste = e.clipboardData.getData("text").replace(/\D/g, "");
        if (paste.length === 6) {
            setOtp(paste.split(""));
            inputRefs.current[5]?.focus();
            verifyOTP(paste);
        }
    };

    const verifyOTP = async (otpCode: string) => {
        try {
            const response = await authClient.signIn.emailOtp({
                email,
                otp: otpCode,
            });
            if (response.error) {
                showToast("Invalid OTP, Please enter the correct one.");
                return;
            }
            await authClient.revokeOtherSessions();
            refetchSession();
            showToast("OTP Verified Successfully!");
            navigate("/omegle");
        } catch (err) {
            console.log(err);
            showToast("Invalid OTP. Please try again.");
        }
    };

    const handleResend = async () => {
        setOtp(["", "", "", "", "", ""]);
        setTimer(60);
        setCanResend(false);
        inputRefs.current[0]?.focus();
        // Call backend to resend OTP
        const resendResponse = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "sign-in",
        });
        if (resendResponse.data?.success) {
            showToast("OTP sent, Please check your Mail !");
        }
    };

    useEffect(() => {
        if (timer <= 0) {
            showToast("OTP expired, Please click resend !");
        }
    }, [timer]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative overflow-hidden">
                {/* Decorative bubbles */}
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-pink-100 opacity-70"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-100 opacity-70"></div>
                <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 opacity-50"></div>

                {/* <h1 className="text-2xl font-bold text-center text-purple-700 mb-6"> */}
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                    OTP Verification
                </h1>
                <p className="text-center text-gray-600 mb-4">
                    Enter the 6-digit code sent to your device
                </p>
                <div
                    className="flex justify-center gap-2 mb-6"
                    onPaste={handlePaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleInputChange(index, e.target.value)}
                            onKeyDown={handleKeyDown.bind(null, index)}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            className="w-12 h-12 text-center text-xl font-semibold rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-purple-50 text-purple-700"
                            autoFocus={index === 0}
                        />
                    ))}
                </div>
                <div className="text-center">
                    <p className="text-gray-600 mb-4 text-sm">
                        {timer > 0 ? `Code expires in ${timer} seconds` : ""}
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`px-4 py-2 rounded-full font-semibold text-white transition-all ${
                            canResend
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-purple-300 cursor-not-allowed"
                        }`}
                    >
                        Resend OTP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OTPInput;
